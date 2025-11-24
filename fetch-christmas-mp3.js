const christmasSongs = [
  { id: "0SqDX816191UcXGO3yFrep", name: "Rockin' Around The Christmas Tree", artist: "Brenda Lee" },
  { id: "0bYg9bo50gSsH3LtXe2SQn", name: "All I Want for Christmas Is You", artist: "Mariah Carey" },
  { id: "0lizgQ7Qw35od7CYaoMBZb", name: "Santa Tell Me", artist: "Ariana Grande" },
  { id: "1HlQna61KjPPN60LkHmfmb", name: "Let It Snow! Let It Snow! Let It Snow!", artist: "Dean Martin" },
  { id: "7vQbuQcyTflfCIOu3Uzzya", name: "Jingle Bell Rock", artist: "Bobby Helms" }
];

async function fetchMp3Url(trackId, trackName) {
  try {
    const response = await fetch(`https://spotify-downloader9.p.rapidapi.com/downloadSong?songId=${trackId}`, {
      headers: {
        'x-rapidapi-host': 'spotify-downloader9.p.rapidapi.com',
        'x-rapidapi-key': 'b679619f29msh06e0c950d671f54p1e1c68jsn8c1b53ab95bd'
      }
    });

    if (!response.ok) {
      console.log(`❌ Erreur ${response.status} pour: ${trackName}`);
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.data?.downloadLink) {
      console.log(`✅ MP3 trouvé pour: ${trackName}`);
      return data.data.downloadLink;
    } else {
      console.log(`⚠️  Pas de lien MP3 pour: ${trackName}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Erreur pour ${trackName}:`, error.message);
    return null;
  }
}

async function main() {
  console.log("🎄 Récupération des MP3 pour les chansons de Noël...\n");
  
  for (const song of christmasSongs) {
    const mp3Url = await fetchMp3Url(song.id, song.name);
    
    if (mp3Url) {
      console.log(`{\n  id: "${song.id}",\n  name: "${song.name}",\n  artist: "${song.artist}",\n  spotifyUrl: "https://open.spotify.com/track/${song.id}",\n  uri: "spotify:track:${song.id}",\n  mp3Url: "${mp3Url}"\n},\n`);
    }
    
    // Petit délai pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main();
