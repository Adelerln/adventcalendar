import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

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
      try {
        // Utiliser juste le trackId (les deux formats fonctionnent, mais l'ID est plus simple)
        const downloadUrl = `https://spotify-downloader9.p.rapidapi.com/downloadSong?songId=${track.id}`;
        
        console.log(`🎵 Recherche MP3 pour: ${track.name} (ID: ${track.id})`);
        
        const response = await fetch(downloadUrl, {
          method: "GET",
          headers: {
            "x-rapidapi-key": rapidApiKey,
            "x-rapidapi-host": "spotify-downloader9.p.rapidapi.com",
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Vérifier si le téléchargement a réussi
          if (data.success && data.data?.downloadLink) {
            console.log(`✅ MP3 trouvé pour ${track.name}: ${data.data.downloadLink}`);
            return {
              ...track,
              downloadUrl: data.data.downloadLink,
              mp3Url: data.data.downloadLink,
              // Optionnel: enrichir avec d'autres infos de RapidAPI si disponibles
              releaseDate: data.data.releaseDate,
            };
          } else {
            console.warn(`⚠️  Pas de MP3 disponible pour ${track.name}:`, data.message || "Chanson non trouvée");
          }
        } else {
          console.error(`❌ Erreur HTTP ${response.status} pour ${track.name}`);
        }
        
        // Si échec, retourner le track sans lien MP3
        return track;
      } catch (error) {
        console.error(`❌ Erreur enrichissement MP3 pour ${track.name}:`, error);
        return track;
      }
    })
  );

  return enrichedTracks;
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
