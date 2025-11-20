# Intégration Spotify

Ce document explique comment l'intégration Spotify fonctionne dans l'application Advent Calendar.

## API Utilisée

Nous utilisons l'API **Spotify Downloader** disponible sur RapidAPI pour rechercher et récupérer des informations sur les pistes Spotify.

- **Service**: spotify-downloader9.p.rapidapi.com
- **Documentation**: https://rapidapi.com/omarbzd47/api/spotify-downloader9

## Configuration

### 1. Obtenir une clé API RapidAPI

1. Créez un compte sur [RapidAPI](https://rapidapi.com/)
2. Abonnez-vous à l'API [Spotify Downloader](https://rapidapi.com/omarbzd47/api/spotify-downloader9)
3. Copiez votre clé API `x-rapidapi-key`

### 2. Configuration de l'environnement

Ajoutez la variable d'environnement suivante dans votre fichier `.env.local` :

```bash
RAPIDAPI_KEY=your_rapidapi_key_here
```

## Fonctionnalités Implémentées

### Recherche de Musique

**Endpoint**: `/api/spotify/search`

- **Méthode**: POST
- **Body**: `{ query: string }`
- **Réponse**: Liste de pistes correspondant à la recherche

**Exemple de requête**:
```javascript
const response = await fetch("/api/spotify/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: "Jingle Bells" })
});

const data = await response.json();
console.log(data.tracks);
```

**Exemple de réponse**:
```json
{
  "tracks": [
    {
      "id": "track_id",
      "name": "Jingle Bells",
      "artist": "Various Artists",
      "album": "Christmas Classics",
      "albumArt": "https://i.scdn.co/image/...",
      "previewUrl": "https://p.scdnurl.com/mp3-preview/...",
      "spotifyUrl": "https://open.spotify.com/track/...",
      "uri": "spotify:track:...",
      "duration": 180000
    }
  ]
}
```

## Composants Frontend

### SpotifySearchModal

Le composant `SpotifySearchModal` permet aux utilisateurs de :

1. Rechercher des pistes Spotify
2. Voir les résultats avec pochettes d'album
3. Écouter un extrait de 30 secondes (si disponible)
4. Sélectionner une piste pour l'ajouter à leur calendrier

**Utilisation**:
```tsx
import SpotifySearchModal from "@/components/SpotifySearchModal";

<SpotifySearchModal
  plan={currentPlan}
  onSelect={(track) => {
    // Traiter la piste sélectionnée
    console.log("Piste sélectionnée:", track);
  }}
  onClose={() => setShowModal(false)}
/>
```

## API RapidAPI - Endpoints Disponibles

Bien que nous utilisions principalement la recherche, l'API offre d'autres fonctionnalités :

### Recherche
- `GET /search?q={query}&type=track&limit=10`

### Téléchargement (non utilisé actuellement)
- `GET /downloadSong?songId={id}`
- `GET /downloadPlaylist?playlistId={id}`
- `GET /downloadAlbum?albumId={id}`

### Informations détaillées
- `GET /tracks?ids={trackIds}`
- `GET /albums?ids={albumIds}`
- `GET /artist?id={artistId}`
- `GET /playlist?id={playlistId}`

### Recommandations
- `GET /recommendations?seedArtists={ids}&seedGenres={genres}&seedTracks={ids}`

## Mode Fallback

Si l'API RapidAPI n'est pas disponible ou si la clé API est manquante, le système bascule automatiquement en mode fallback avec des résultats mockés pour le développement.

## Limitations

- **Rate Limiting**: Vérifiez les limites de votre plan RapidAPI
- **Preview URLs**: Toutes les pistes n'ont pas forcément un extrait de 30 secondes disponible
- **Région**: Certaines pistes peuvent ne pas être disponibles dans toutes les régions

## Sécurité

⚠️ **Important**: Ne jamais exposer votre clé RapidAPI côté client. Toutes les requêtes à l'API Spotify doivent passer par votre backend (`/api/spotify/search`).

## Évolution Future

Fonctionnalités potentielles à ajouter :

- [ ] Téléchargement de playlists complètes
- [ ] Recommandations personnalisées basées sur les choix précédents
- [ ] Recherche par artiste ou album
- [ ] Intégration avec les playlists Spotify de l'utilisateur
