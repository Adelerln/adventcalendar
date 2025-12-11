import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const songUrl = searchParams.get('url') || 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp';
  
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  
  if (!rapidApiKey) {
    return NextResponse.json({ error: "RAPIDAPI_KEY manquante" });
  }

  try {
    console.log("Testing RapidAPI download for:", songUrl);
    
    // Test 1: Avec l'URL complète
    const downloadUrl1 = `https://spotify-downloader9.p.rapidapi.com/downloadSong?songId=${encodeURIComponent(songUrl)}`;
    
    const response1 = await fetch(downloadUrl1, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "spotify-downloader9.p.rapidapi.com",
      },
    });

    const data1 = await response1.json();
    
    // Test 2: Extraire l'ID et réessayer
    const trackId = songUrl.split('/track/')[1]?.split('?')[0];
    const downloadUrl2 = `https://spotify-downloader9.p.rapidapi.com/downloadSong?songId=${trackId}`;
    
    const response2 = await fetch(downloadUrl2, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "spotify-downloader9.p.rapidapi.com",
      },
    });

    const data2 = await response2.json();
    
    return NextResponse.json({
      test1_avec_url_complete: {
        url: downloadUrl1,
        status: response1.status,
        data: data1,
      },
      test2_avec_id_seulement: {
        url: downloadUrl2,
        trackId: trackId,
        status: response2.status,
        data: data2,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    });
  }
}
