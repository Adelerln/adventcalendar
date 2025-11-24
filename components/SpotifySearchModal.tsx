"use client";

import { useEffect, useState } from "react";
import { type PlanKey } from "@/lib/plan-theme";

type SpotifyTrack = {
  id: string;
  name: string;
  artist: string;
  album?: string;
  albumArt?: string;
  previewUrl?: string;
  spotifyUrl: string;
  uri: string;
  duration?: number;
  mp3Url?: string;
  downloadUrl?: string;
};

type Props = {
  plan: PlanKey;
  onSelect: (track: SpotifyTrack) => void;
  onClose: () => void;
};

export default function SpotifySearchModal({ plan, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectingTrackId, setSelectingTrackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Recommandations pré-configurées avec tracks complets
  const recommendations = {
    christmas: [
      { 
        id: "0SqDX816191UcXGO3yFrep",
        name: "Rockin' Around The Christmas Tree",
        artist: "Brenda Lee",
        spotifyUrl: "https://open.spotify.com/track/0SqDX816191UcXGO3yFrep",
        uri: "spotify:track:0SqDX816191UcXGO3yFrep",
        mp3Url: "https://spotify-api.mybackend.in/download/Brenda%20Lee/Merry%20Christmas%20From%20Brenda%20Lee/Rockin%27%20Around%20The%20Christmas%20Tree-2EjXfH91m7f8HiJN1yQg97.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251124%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251124T084413Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=f546d2566d0ec67b2a470001230ca90f120fb3105bd98e4df3a8508fe6e4e933"
      },
      { 
        id: "0bYg9bo50gSsH3LtXe2SQn",
        name: "All I Want for Christmas Is You",
        artist: "Mariah Carey",
        spotifyUrl: "https://open.spotify.com/track/0bYg9bo50gSsH3LtXe2SQn",
        uri: "spotify:track:0bYg9bo50gSsH3LtXe2SQn",
        mp3Url: "https://spotify-api.mybackend.in/download/Mariah%20Carey/Merry%20Christmas/All%20I%20Want%20for%20Christmas%20Is%20You-0bYg9bo50gSsH3LtXe2SQn.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251124%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251124T084818Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=8295d585d9bef7bb26b7992e2997405f08e90753c663ff8d4269434d33b8bf55"
      },
      { 
        id: "0lizgQ7Qw35od7CYaoMBZb",
        name: "Santa Tell Me",
        artist: "Ariana Grande",
        spotifyUrl: "https://open.spotify.com/track/0lizgQ7Qw35od7CYaoMBZb",
        uri: "spotify:track:0lizgQ7Qw35od7CYaoMBZb",
        mp3Url: "https://spotify-api.mybackend.in/download/Ariana%20Grande/Santa%20Tell%20Me/Santa%20Tell%20Me-0lizgQ7Qw35od7CYaoMBZb.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251124%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251124T084858Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=b4f3d809b274c31130ce0fb23a2f056c52e7bf3584396f804c5b962160470b46"
      },
      { 
        id: "1HlQna61KjPPN60LkHmfmb",
        name: "Let It Snow! Let It Snow! Let It Snow!",
        artist: "Dean Martin",
        spotifyUrl: "https://open.spotify.com/track/1HlQna61KjPPN60LkHmfmb",
        uri: "spotify:track:1HlQna61KjPPN60LkHmfmb",
        mp3Url: "https://spotify-api.mybackend.in/download/Dean%20Martin%20-%20Let%20It%20Snow%21%20Let%20It%20Snow%21%20Let%20It%20Snow%21.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251124%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251124T085000Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=c12c6966621f19ffeeb995ed226c53895221a86af4c367834ad332d11bbd8b9a"
      },
      { 
        id: "7vQbuQcyTflfCIOu3Uzzya",
        name: "Jingle Bell Rock",
        artist: "Bobby Helms",
        spotifyUrl: "https://open.spotify.com/track/7vQbuQcyTflfCIOu3Uzzya",
        uri: "spotify:track:7vQbuQcyTflfCIOu3Uzzya",
        mp3Url: "https://spotify-api.mybackend.in/download/Bobby%20Helms/Jingle%20Bell%20Rock/Captain%20Santa%20Claus%20%28And%20His%20Reindeer%20Space%20Patrol%29/Jingle%20Bell%20Rock-7vQbuQcyTflfCIOu3Uzzya.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251124%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251124T084436Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=63da000fbd144fe796a47d35dca5c3badfc4bc381cf5f4831d09f1416228fef5"
      }
    ],
    romantic: [
      { 
        id: "6RKuyWarJu8SMrflntmyXx",
        name: "La Vie en rose",
        artist: "Édith Piaf",
        spotifyUrl: "https://open.spotify.com/track/6RKuyWarJu8SMrflntmyXx",
        uri: "spotify:track:6RKuyWarJu8SMrflntmyXx",
        mp3Url: "https://spotify-api.mybackend.in/download/%C3%89dith%20Piaf/Eternelle/La%20Vie%20en%20rose-6RKuyWarJu8SMrflntmyXx.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T224743Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=0e8ecdbb578294cbdcf16ced4d33877a98e92db0b22daa01a476d018a614c70d"
      },
      { 
        id: "0tgVpDi06FyKpA1z0VMD4v", 
        name: "Perfect", 
        artist: "Ed Sheeran",
        spotifyUrl: "https://open.spotify.com/track/0tgVpDi06FyKpA1z0VMD4v",
        uri: "spotify:track:0tgVpDi06FyKpA1z0VMD4v",
        mp3Url: "https://spotify-api.mybackend.in/download/Ed%20Sheeran/%C3%B7%20%28Deluxe%29/Perfect-0tgVpDi06FyKpA1z0VMD4v.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T224834Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=8e579a011886fb4acf5c2b197eaccf3f515f3a1c4bcef67db16e0f011c302d7c"
      },
      { 
        id: "3U4isOIWM3VvDubwSI3y7a", 
        name: "All of Me", 
        artist: "John Legend",
        spotifyUrl: "https://open.spotify.com/track/3U4isOIWM3VvDubwSI3y7a",
        uri: "spotify:track:3U4isOIWM3VvDubwSI3y7a",
        mp3Url: "https://spotify-api.mybackend.in/download/John%20Legend/Love%20In%20The%20Future%20%28Expanded%20Edition%29/All%20of%20Me-3U4isOIWM3VvDubwSI3y7a.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T230659Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=594342d4044f913b2ca9baa2291cf6a62636a33c78b01d2e65a6610a41bd8529"
      },
      { 
        id: "03H03k1F6t3VqCSPRBtuHk", 
        name: "a thousand years", 
        artist: "Christina Perri",
        spotifyUrl: "https://open.spotify.com/track/03H03k1F6t3VqCSPRBtuHk",
        uri: "spotify:track:03H03k1F6t3VqCSPRBtuHk",
        mp3Url: "https://spotify-api.mybackend.in/download/Christina%20Perri/The%20Twilight%20Saga%3A%20Breaking%20Dawn%20-%20Part%201%20%28Original%20Motion%20Picture%20Soundtrack%29/a%20thousand%20years-03H03k1F6t3VqCSPRBtuHk.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T224924Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=363e898b42d20715ce825740f49e06ce083bf1021cfdd6520f97be1c4625cdb4"
      },
      { 
        id: "28mwuJqKOjRpqo14GuKSkj", 
        name: "Je T'aime", 
        artist: "Lara Fabian",
        spotifyUrl: "https://open.spotify.com/track/28mwuJqKOjRpqo14GuKSkj",
        uri: "spotify:track:28mwuJqKOjRpqo14GuKSkj",
        mp3Url: "https://spotify-api.mybackend.in/download/Lara%20Fabian/Pure/Je%20T%E2%80%99aime-28mwuJqKOjRpqo14GuKSkj.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T224945Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e6f6960278b54bd710ea9dc43241fb3978ce579817c013f6d352284cbcd52735"
      },
      { 
        id: "34gCuhDGsG4bRPIf9bb02f", 
        name: "Thinking out Loud", 
        artist: "Ed Sheeran",
        spotifyUrl: "https://open.spotify.com/track/34gCuhDGsG4bRPIf9bb02f",
        uri: "spotify:track:34gCuhDGsG4bRPIf9bb02f",
        mp3Url: "https://spotify-api.mybackend.in/download/Ed%20Sheeran/x%20%28Deluxe%20Edition%29/Thinking%20out%20Loud-34gCuhDGsG4bRPIf9bb02f.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T230507Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=3ab8ebad25274b43558541368126606da08967e647f4b9862a3cb94be64cbd7f"
      }
    ],
    friendly: [
      { 
        id: "3B5UbSndRz907IZhhmUfLi", 
        name: "Count on Me", 
        artist: "Bruno Mars",
        spotifyUrl: "https://open.spotify.com/track/3B5UbSndRz907IZhhmUfLi",
        uri: "spotify:track:3B5UbSndRz907IZhhmUfLi",
        mp3Url: "https://spotify-api.mybackend.in/download/Bruno%20Mars%20-%20Count%20on%20Me.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T232517Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=e067e8e25c18054185956add85f156c24606556b7fd470f66fd9e29bae836272"
      },
      { 
        id: "5zCJvrT3C7cIfHsR5iG95l", 
        name: "Lean on Me", 
        artist: "Bill Withers",
        spotifyUrl: "https://open.spotify.com/track/5zCJvrT3C7cIfHsR5iG95l",
        uri: "spotify:track:5zCJvrT3C7cIfHsR5iG95l",
        mp3Url: "https://spotify-api.mybackend.in/download/Bill%20Withers/Lean%20on%20Me%3A%20The%20Best%20of%20Bill%20Withers/Lean%20on%20Me-5zCJvrT3C7cIfHsR5iG95l.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T233245Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=678a1df1f4dc1f3205b7b87637d51fcf18a95a837ebc99782271456ece72a54b"
      },
      { 
        id: "3SdTKo2uVsxFblQjpScoHy", 
        name: "Stand By Me", 
        artist: "Ben E. King",
        spotifyUrl: "https://open.spotify.com/track/3SdTKo2uVsxFblQjpScoHy",
        uri: "spotify:track:3SdTKo2uVsxFblQjpScoHy",
        mp3Url: "https://spotify-api.mybackend.in/download/Ben%20E.%20King/Don%27t%20Play%20That%20Song%20%28Mono%29/Stand%20By%20Me-3SdTKo2uVsxFblQjpScoHy.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T232543Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=348f01327c157c1b4ad3927757f596a09e9b91eefdd708319c99fec9b44921ec"
      },
      { 
        id: "5ONuwMIXAukbMNQCCSjjm0", 
        name: "You've Got a Friend", 
        artist: "James Taylor",
        spotifyUrl: "https://open.spotify.com/track/5ONuwMIXAukbMNQCCSjjm0",
        uri: "spotify:track:5ONuwMIXAukbMNQCCSjjm0",
        mp3Url: "https://spotify-api.mybackend.in/download/James%20Taylor/Greatest%20Hits/You%27ve%20Got%20a%20Friend-5ONuwMIXAukbMNQCCSjjm0.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T232552Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=140399e9160cb4e9a98ee448b0de860698662040fa915c18b3dd5ceaa796dc12"
      },
      { 
        id: "2RnPATK99oGOZygnD2GTO6", 
        name: "With A Little Help From My Friends - Remastered 2009", 
        artist: "The Beatles",
        spotifyUrl: "https://open.spotify.com/track/2RnPATK99oGOZygnD2GTO6",
        uri: "spotify:track:2RnPATK99oGOZygnD2GTO6",
        mp3Url: "https://spotify-api.mybackend.in/download/The%20Beatles/Sgt.%20Pepper%27s%20Lonely%20Hearts%20Club%20Band%20%28Remastered%29/With%20A%20Little%20Help%20From%20My%20Friends%20-%20Remastered%202009-2RnPATK99oGOZygnD2GTO6.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T232626Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=1e14300425c4d556f8c2ad16c55cb6bea11302d315e159ed1b11fffc0ebdca9e"
      },
      { 
        id: "2etHQJxIbV0soyPhelVs9Y", 
        name: "Best Friend (feat. Doja Cat)", 
        artist: "Saweetie, Doja Cat",
        spotifyUrl: "https://open.spotify.com/track/2etHQJxIbV0soyPhelVs9Y",
        uri: "spotify:track:2etHQJxIbV0soyPhelVs9Y",
        mp3Url: "https://spotify-api.mybackend.in/download/Saweetie%2C%20Doja%20Cat/Best%20Friend%20%28feat.%20Doja%20Cat%29/Best%20Friend%20%28feat.%20Doja%20Cat%29-2etHQJxIbV0soyPhelVs9Y.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T232639Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=d6f68054ec0368b255a1306e46b3e3955d782e7e785443541ba8784f45e75a87"
      }
    ],
    family: [
      { 
        id: "29U7stRjqHU6rMiS8BfaI9", 
        name: "What A Wonderful World", 
        artist: "Louis Armstrong",
        spotifyUrl: "https://open.spotify.com/track/29U7stRjqHU6rMiS8BfaI9",
        uri: "spotify:track:29U7stRjqHU6rMiS8BfaI9",
        mp3Url: "https://spotify-api.mybackend.in/download/Louis%20Armstrong%20-%20What%20A%20Wonderful%20World.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T230057Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=91722924f215af47f9282cec91daf0ec866b14c5eb55bf7824f4342c5a583c03"
      },
      { 
        id: "4yDjzVhXig9tfO7Zv46FE8", 
        name: "Over the Rainbow", 
        artist: "Israel Kamakawiwo'ole",
        spotifyUrl: "https://open.spotify.com/track/4yDjzVhXig9tfO7Zv46FE8",
        uri: "spotify:track:4yDjzVhXig9tfO7Zv46FE8",
        mp3Url: "https://spotify-api.mybackend.in/download/Israel%20Kamakawiwo%27ole/Somewhere%20Over%20the%20Rainbow%20The%20Best%20of%20Israel%20Kamakawiwo%60ole/Over%20the%20Rainbow-4yDjzVhXig9tfO7Zv46FE8.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T232649Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=4eb81e3aec48a697b20ce097dd8f399d1dbfe182207ce3667ea526d0a12221f2"
      },
      { 
        id: "0n2pjCIMKwHSXoYfEbYMfX", 
        name: "You Are The Sunshine Of My Life", 
        artist: "Stevie Wonder",
        spotifyUrl: "https://open.spotify.com/track/0n2pjCIMKwHSXoYfEbYMfX",
        uri: "spotify:track:0n2pjCIMKwHSXoYfEbYMfX",
        mp3Url: "https://spotify-api.mybackend.in/download/Stevie%20Wonder/Talking%20Book/You%20Are%20The%20Sunshine%20Of%20My%20Life-0n2pjCIMKwHSXoYfEbYMfX.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T232703Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=7f77cce30ae6762cf041c476ee1ddcfaa8011d6f81ff4b18970c6343eacd2ac4"
      },
      { 
        id: "3ySeIhBjPR5oMSRfhQTP0W", 
        name: "Mama - English Version", 
        artist: "Il Divo",
        spotifyUrl: "https://open.spotify.com/track/3ySeIhBjPR5oMSRfhQTP0W",
        uri: "spotify:track:3ySeIhBjPR5oMSRfhQTP0W",
        mp3Url: "https://spotify-api.mybackend.in/download/Il%20Divo/Il%20Divo/Mama%20-%20English%20Version-3ySeIhBjPR5oMSRfhQTP0W.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T232723Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=1cd229dbf5052ae0d2b498fed5c0ab9ca17c7da558187aa16be8b95cd7299c98"
      },
      { 
        id: "6ON9UuIq49xXY9GPmHIYRp", 
        name: "The Best Day (Taylor's Version)", 
        artist: "Taylor Swift",
        spotifyUrl: "https://open.spotify.com/track/6ON9UuIq49xXY9GPmHIYRp",
        uri: "spotify:track:6ON9UuIq49xXY9GPmHIYRp",
        mp3Url: "https://spotify-api.mybackend.in/download/Taylor%20Swift/Fearless%20%28Taylor%27s%20Version%29/The%20Best%20Day%20%28Taylor%E2%80%99s%20Version%29-6ON9UuIq49xXY9GPmHIYRp.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T232730Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=908c5b59bf847ac453360733cdce1236d997c4ee19b8dc8e8a36a57cedc47588"
      },
      { 
        id: "4S1VYqwfkLit9mKVY3MXoo", 
        name: "Forever Young", 
        artist: "Alphaville",
        spotifyUrl: "https://open.spotify.com/track/4S1VYqwfkLit9mKVY3MXoo",
        uri: "spotify:track:4S1VYqwfkLit9mKVY3MXoo",
        mp3Url: "https://spotify-api.mybackend.in/download/Alphaville/Forever%20Young/Forever%20Young-4S1VYqwfkLit9mKVY3MXoo.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=fb1f22f7dff2534061496f49%2F20251123%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20251123T232742Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=0b2fc2b7f9a62ecd367159c335682a711ba8b09b63d811689611ec32aa689b23"
      }
    ]
  };

  const handleRecommendationClick = async (rec: { id: string; name: string; artist: string; mp3Url?: string; spotifyUrl?: string; uri?: string }) => {
    setSearching(true);
    setError(null);

    try {
      // Si on a déjà le MP3, sélection directe sans recherche
      if (rec.mp3Url) {
        console.log(`✅ MP3 pré-configuré pour: ${rec.name}, sélection directe...`);
        handleSelectTrack({
          id: rec.id,
          name: rec.name,
          artist: rec.artist,
          spotifyUrl: rec.spotifyUrl || `https://open.spotify.com/track/${rec.id}`,
          uri: rec.uri || `spotify:track:${rec.id}`,
          mp3Url: rec.mp3Url
        });
        setSearching(false);
        return;
      }

      console.log(`🎵 Recherche de la recommandation: ${rec.name}`);
      
      // Chercher juste par titre (sans l'artiste) pour de meilleurs résultats
      const response = await fetch("/api/spotify/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: rec.name })
      });

      console.log(`📡 Réponse API status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erreur API:", errorData);
        throw new Error(`Erreur API: ${errorData.error || 'Inconnue'}`);
      }

      const data = await response.json();
      console.log("✅ Données reçues:", data);
      
      // Prendre le premier résultat (c'est généralement la bonne version)
      const track = data.tracks?.[0];
      
      if (track) {
        console.log("🎵 Chanson trouvée, sélection automatique...", track);
        // Sélectionner directement sans afficher les résultats
        handleSelectTrack(track);
      } else {
        console.error("❌ Aucune chanson dans la réponse");
        throw new Error("Chanson non trouvée");
      }
    } catch (err: any) {
      console.error("💥 Erreur complète:", err);
      setError(`Impossible de charger cette chanson: ${err.message}`);
    } finally {
      setSearching(false);
    }
  };

  const runSearch = async (q: string, signal?: AbortSignal) => {
    setSearching(true);
    setError(null);

    try {
      const response = await fetch("/api/spotify/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
        cache: "no-store",
        signal
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Erreur lors de la recherche");
      }

      setTracks(data.tracks || []);

      if (data?.error) {
        setError(data.error);
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("Recherche Spotify échouée:", err);
      setError(err?.message || "Impossible de rechercher sur Spotify. Réessayez.");
      // Afficher quand même des suggestions pour ne pas bloquer l'utilisateur
      const fallback = Object.values(recommendations).flat();
      if (fallback.length) {
        setTracks(fallback);
      }
    } finally {
      setSearching(false);
    }
  };

  // Lancer la recherche automatiquement lors de la saisie (debounce)
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setTracks([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      runSearch(q, controller.signal);
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handlePlayPreview = (previewUrl: string, trackId: string) => {
    // Arrêter la lecture en cours
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (playingPreview === trackId) {
      setPlayingPreview(null);
      setAudioElement(null);
      return;
    }

    // Lire le nouveau preview
    const audio = new Audio(previewUrl);
    audio.play();
    audio.onended = () => {
      setPlayingPreview(null);
      setAudioElement(null);
    };
    
    setAudioElement(audio);
    setPlayingPreview(trackId);
  };

  const handleSelectTrack = async (track: SpotifyTrack) => {
    // Arrêter la lecture
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    setSelectingTrackId(track.id);
    setError(null);

    try {
      // Récupérer la piste enrichie (MP3) uniquement au moment du choix
      const response = await fetch("/api/spotify/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: track.id, forceDownload: true }),
        cache: "no-store"
      });

      const data = await response.json();
      const enriched = data?.tracks?.[0];

      if (!response.ok) {
        throw new Error(data?.error || "Erreur lors du chargement de la chanson");
      }

      if (enriched) {
        onSelect(enriched);
      } else {
        onSelect(track);
      }
      onClose();
    } catch (err: any) {
      console.error("Sélection de piste échouée:", err);
      setError(err?.message || "Impossible de charger cette chanson.");
      // Utiliser la piste de base si l'enrichissement échoue
      onSelect(track);
      onClose();
    } finally {
      setSelectingTrackId(null);
    }
  };

  const isPremium = plan === "plan_premium";
  const bgGradient = isPremium 
    ? "bg-gradient-to-br from-[#fbeedc] to-[#fff7ee]" 
    : "bg-gradient-to-br from-[#f4f6fb] to-white";
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className={`${bgGradient} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-black/10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">🎵</span>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Recherche Spotify</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-semibold transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Search form (auto-search on typing, button for relancer) */}
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom de la chanson, artiste..."
              className="flex-1 rounded-xl border-2 border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                const q = query.trim();
                if (q) runSearch(q);
              }}
              disabled={searching || !query.trim()}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                color: '#4a0808'
              }}
            >
              {searching ? "..." : "🔍"}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Recommandations - Maintenant dans la zone scrollable */}
          {!query && tracks.length === 0 && !searching && (
            <div className="space-y-4 mb-6">
              {/* Noël */}
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  🎄 Suggestions de Noël
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {recommendations.christmas.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => handleRecommendationClick(rec)}
                      disabled={searching || !!selectingTrackId}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full bg-white border-2 border-gray-200 text-gray-800 hover:border-[#d4af37] hover:bg-[#fff7ee] transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {rec.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Romantiques */}
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  💝 Suggestions romantiques
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {recommendations.romantic.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => handleRecommendationClick(rec)}
                      disabled={searching || !!selectingTrackId}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full bg-white border-2 border-gray-200 text-gray-800 hover:border-[#d4af37] hover:bg-[#fff7ee] transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {rec.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amicales */}
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  🤝 Suggestions amicales
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {recommendations.friendly.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => handleRecommendationClick(rec)}
                      disabled={searching || !!selectingTrackId}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full bg-white border-2 border-gray-200 text-gray-800 hover:border-[#d4af37] hover:bg-[#fff7ee] transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {rec.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Familiales */}
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  👨‍👩‍👧‍👦 Suggestions familiales
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {recommendations.family.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => handleRecommendationClick(rec)}
                      disabled={searching || !!selectingTrackId}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full bg-white border-2 border-gray-200 text-gray-800 hover:border-[#d4af37] hover:bg-[#fff7ee] transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {rec.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {searching && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-bounce">🎵</div>
              <p className="text-gray-900 font-medium">Recherche en cours...</p>
            </div>
          )}

          {!searching && tracks.length === 0 && query && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-800 font-medium">Aucun résultat trouvé</p>
            </div>
          )}

          {!searching && tracks.length === 0 && !query && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎼</div>
              <p className="text-gray-800 font-medium">Recherchez une chanson pour commencer</p>
            </div>
          )}

          {tracks.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-white rounded-xl p-3 sm:p-4 border-2 border-gray-200 hover:border-[#d4af37] transition-all group"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Album Art */}
                    {track.albumArt && (
                      <img
                        src={track.albumArt}
                        alt={track.album || "Album"}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    
                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">{track.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-800 truncate">{track.artist}</p>
                      {track.album && (
                        <p className="text-xs text-gray-700 truncate hidden sm:block">{track.album}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      {/* Preview button */}
                      {track.previewUrl && (
                        <button
                          onClick={() => handlePlayPreview(track.previewUrl!, track.id)}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-sm sm:text-base"
                          title="Écouter un extrait"
                        >
                          {playingPreview === track.id ? "⏸️" : "▶️"}
                        </button>
                      )}

                      {/* Select button */}
                      <button
                        onClick={() => handleSelectTrack(track)}
                        disabled={!!selectingTrackId}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                          color: '#4a0808'
                        }}
                      >
                        {selectingTrackId === track.id ? "🎄 Téléchargement..." : "Choisir"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectingTrackId && (
            <div className="mt-4 rounded-xl border-2 border-[#d4af37] bg-gradient-to-r from-[#8b0000] via-[#b22222] to-[#8b0000] text-white p-4 shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎅</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Téléchargement du MP3 en cours...</p>
                  <p className="text-xs opacity-90">Les lutins emballent votre chanson sélectionnée.</p>
                </div>
                <div className="text-2xl animate-bounce">🎁</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/10 bg-gray-50/50 text-center text-xs text-gray-800">
          Propulsé par Spotify 🎵
        </div>
      </div>
    </div>
  );
}
