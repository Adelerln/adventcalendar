import { NextResponse } from "next/server";

// Simple in-memory cache to avoid re-hitting RapidAPI for the same track in a short window
const mp3Cache = new Map<string, { url: string; fetchedAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const RAPIDAPI_HOST = "spotify-downloader9.p.rapidapi.com";
const SEARCH_LIMIT = 6; // reduce payload for faster responses

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
  const enriched: any[] = [];

  for (const track of tracks) {
    const cached = getCachedMp3(track.id);
    if (cached) {
      enriched.push({
        ...track,
        downloadUrl: cached,
        mp3Url: cached
      });
      continue;
    }

    try {
      const downloadUrl = `https://${RAPIDAPI_HOST}/downloadSong?songId=${track.id}`;
      console.log(`🎵 Recherche MP3 pour: ${track.name} (ID: ${track.id})`);

      // Éviter de spammer RapidAPI: petites pauses + retry sur 429/5xx
      await wait(250);
      const response = await fetchWithRetry(downloadUrl, {
        method: "GET",
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      });

      if (response?.ok) {
        const data = await response.json();

        if (data.success && data.data?.downloadLink) {
          console.log(`✅ MP3 trouvé pour ${track.name}: ${data.data.downloadLink}`);
          mp3Cache.set(track.id, { url: data.data.downloadLink, fetchedAt: Date.now() });
          enriched.push({
            ...track,
            downloadUrl: data.data.downloadLink,
            mp3Url: data.data.downloadLink,
            releaseDate: data.data.releaseDate,
          });
          continue;
        }
      }

      console.warn(`⚠️ Pas de MP3 disponible pour ${track.name}`);
      enriched.push(track);
    } catch (error) {
      console.error(`❌ Erreur enrichissement MP3 pour ${track.name}:`, error);
      enriched.push(track);
    }
  }

  return enriched;
}

// Recherche avec l'API Spotify Web publique
async function searchWithSpotifyPublicAPI(query: string) {
  try {
    const accessToken = await getSpotifyAccessToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${SEARCH_LIMIT}`,
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

function getCachedMp3(trackId: string) {
  const cached = mp3Cache.get(trackId);
  if (!cached) return null;

  const isFresh = Date.now() - cached.fetchedAt < CACHE_TTL_MS;
  if (!isFresh) {
    mp3Cache.delete(trackId);
    return null;
  }

  return cached.url;
}

async function fetchWithRetry(url: string, options: RequestInit, attempts = 3, delayMs = 600) {
  let lastError: any;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const response = await fetch(url, options);

    // Succès
    if (response.ok) return response;

    // Sur 429 ou 5xx, on retente après une pause
    if (response.status === 429 || response.status >= 500) {
      const waitTime = delayMs * attempt;
      console.warn(`⚠️ Tentative ${attempt}/${attempts} échouée (HTTP ${response.status}). Nouveau try dans ${waitTime}ms.`);
      await wait(waitTime);
      lastError = new Error(`HTTP ${response.status}`);
      continue;
    }

    // Autres codes: on arrête
    lastError = new Error(`HTTP ${response.status}`);
    break;
  }

  throw lastError;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
