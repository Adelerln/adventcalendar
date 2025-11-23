import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query, trackId } = await req.json();

    // Si on a un trackId, chercher directement cette chanson
    if (trackId && typeof trackId === "string") {
      const track = await getTrackById(trackId);
      if (track) {
        const rapidApiKey = process.env.RAPIDAPI_KEY;
        if (rapidApiKey) {
          const enrichedTrack = await fetchMp3WithRetry(track, rapidApiKey, 3);
          return NextResponse.json({ tracks: [enrichedTrack] });
        }
        return NextResponse.json({ tracks: [track] });
      }
      return NextResponse.json({ error: "Chanson non trouvée" }, { status: 404 });
    }

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query invalide" }, { status: 400 });
    }

    // Toujours utiliser l'API Spotify pour la recherche (meilleure qualité)
    const tracks = await searchWithSpotifyPublicAPI(query);
    
    // Si on a RapidAPI configuré, enrichir avec les liens de téléchargement MP3
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (rapidApiKey && tracks.length > 0) {
      console.log("Enrichissement avec RapidAPI pour les liens MP3...");
      const enrichedTracks = await enrichTracksWithMp3Links(tracks, rapidApiKey);
      return NextResponse.json({ tracks: enrichedTracks });
    }

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Error searching Spotify:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la recherche",
      tracks: []
    }, { status: 500 });
  }
}

// Enrichir les tracks avec les liens de téléchargement MP3 via RapidAPI
async function enrichTracksWithMp3Links(tracks: any[], rapidApiKey: string) {
  const enrichedTracks = await Promise.all(
    tracks.map(async (track) => {
      return await fetchMp3WithRetry(track, rapidApiKey, 3); // 3 tentatives max
    })
  );

  return enrichedTracks;
}

// Fonction avec retry pour récupérer le MP3
async function fetchMp3WithRetry(track: any, rapidApiKey: string, maxRetries: number) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const downloadUrl = `https://spotify-downloader9.p.rapidapi.com/downloadSong?songId=${track.id}`;
      
      console.log(`🎵 [Tentative ${attempt}/${maxRetries}] Recherche MP3 pour: ${track.name} (ID: ${track.id})`);
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 secondes timeout
      
      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "spotify-downloader9.p.rapidapi.com",
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        
        // Vérifier si le téléchargement a réussi
        if (data.success && data.data?.downloadLink) {
          console.log(`✅ MP3 trouvé pour ${track.name}: ${data.data.downloadLink}`);
          return {
            ...track,
            downloadUrl: data.data.downloadLink,
            mp3Url: data.data.downloadLink,
            releaseDate: data.data.releaseDate,
          };
        } else {
          console.warn(`⚠️  [Tentative ${attempt}] Pas de MP3 dans la réponse pour ${track.name}:`, data.message || "Chanson non trouvée");
          
          // Si c'est la dernière tentative et qu'on n'a pas de MP3, on retourne sans MP3
          if (attempt === maxRetries) {
            console.error(`❌ Échec définitif après ${maxRetries} tentatives pour ${track.name}`);
            return track;
          }
          
          // Sinon on attend un peu avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Backoff progressif
        }
      } else {
        console.error(`❌ [Tentative ${attempt}] Erreur HTTP ${response.status} pour ${track.name}`);
        
        if (attempt === maxRetries) {
          return track;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`⏱️  [Tentative ${attempt}] Timeout pour ${track.name}`);
      } else {
        console.error(`❌ [Tentative ${attempt}] Erreur pour ${track.name}:`, error.message);
      }
      
      if (attempt === maxRetries) {
        console.error(`❌ Échec définitif après ${maxRetries} tentatives pour ${track.name}`);
        return track;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return track;
}

// Recherche avec l'API Spotify Web publique
async function searchWithSpotifyPublicAPI(query: string) {
  try {
    const accessToken = await getSpotifyAccessToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Spotify API failed");
    }

    const data = await response.json();
    
    const tracks = data.tracks?.items?.map((item: any) => ({
      id: item.id,
      name: item.name,
      artist: item.artists?.map((a: any) => a.name).join(", ") || "Artiste inconnu",
      album: item.album?.name || "",
      albumArt: item.album?.images?.[0]?.url || "",
      previewUrl: item.preview_url,
      spotifyUrl: item.external_urls?.spotify || `https://open.spotify.com/track/${item.id}`,
      uri: item.uri,
      duration: item.duration_ms,
    })) || [];

    return tracks;
  } catch (error) {
    console.error("Spotify public API failed:", error);
    return [];
  }
}

// Récupérer une chanson par son ID Spotify
async function getTrackById(trackId: string) {
  try {
    const accessToken = await getSpotifyAccessToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Erreur lors de la récupération de la chanson ${trackId}`);
      return null;
    }

    const item = await response.json();
    
    return {
      id: item.id,
      name: item.name,
      artist: item.artists?.map((a: any) => a.name).join(", ") || "Artiste inconnu",
      album: item.album?.name || "",
      albumArt: item.album?.images?.[0]?.url || "",
      previewUrl: item.preview_url,
      spotifyUrl: item.external_urls?.spotify || `https://open.spotify.com/track/${item.id}`,
      uri: item.uri,
      duration: item.duration_ms,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération par ID:", error);
    return null;
  }
}

// Obtenir un token d'accès Spotify (Client Credentials Flow)
async function getSpotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials missing");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token");
  }

  const data = await response.json();
  return data.access_token;
}

// Fonction pour générer des résultats mockés basés sur la recherche
function generateMockResults(query: string): any[] {
  const baseId = Math.random().toString(36).substring(7);
  
  return [
    {
      id: `${baseId}1`,
      name: `${query} - Version 1`,
      artist: "Artiste Demo",
      album: "Album Demo",
      albumArt: "https://via.placeholder.com/300x300/1DB954/ffffff?text=Spotify",
      spotifyUrl: `https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp`,
      uri: `spotify:track:3n3Ppam7vgaVa1iaRUc9Lp`,
    },
    {
      id: `${baseId}2`,
      name: `${query} - Version 2`,
      artist: "Artiste Demo 2",
      album: "Album Demo 2",
      albumArt: "https://via.placeholder.com/300x300/1DB954/ffffff?text=Spotify",
      spotifyUrl: `https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b`,
      uri: `spotify:track:0VjIjW4GlUZAMYd2vXMi3b`,
    },
    {
      id: `${baseId}3`,
      name: `Meilleurs résultats pour: ${query}`,
      artist: "Various Artists",
      album: "Compilation",
      albumArt: "https://via.placeholder.com/300x300/1DB954/ffffff?text=Spotify",
      spotifyUrl: `https://open.spotify.com/track/6habFhsOp2NvshLv26DqMb`,
      uri: `spotify:track:6habFhsOp2NvshLv26DqMb`,
    },
  ];
}
