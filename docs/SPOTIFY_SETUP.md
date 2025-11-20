# Configuration Spotify API - Guide Rapide

## Option 1 : Spotify Web API (Recommandé - Gratuit)

Cette méthode utilise l'API officielle de Spotify qui est gratuite et fiable.

### Étapes :

1. **Créer une application Spotify**
   - Allez sur https://developer.spotify.com/dashboard
   - Connectez-vous avec votre compte Spotify (créez-en un si nécessaire)
   - Cliquez sur "Create app"
   
2. **Remplir les informations**
   - **App name**: "Advent Calendar" (ou le nom de votre choix)
   - **App description**: "Music search for advent calendar"
   - **Website**: http://localhost:3000 (ou votre URL de production)
   - **Redirect URIs**: http://localhost:3000/api/spotify/callback (pas nécessaire pour la recherche simple)
   - Cochez "Web API"
   - Acceptez les conditions

3. **Récupérer vos credentials**
   - Une fois l'app créée, cliquez sur "Settings"
   - Vous verrez votre **Client ID**
   - Cliquez sur "View client secret" pour voir votre **Client Secret**

4. **Ajouter dans .env.local**
   ```bash
   SPOTIFY_CLIENT_ID=votre_client_id_ici
   SPOTIFY_CLIENT_SECRET=votre_client_secret_ici
   ```

5. **Redémarrer le serveur**
   ```bash
   npm run dev
   ```

## Option 2 : RapidAPI Spotify Downloader (Fallback)

Si l'API Spotify ne fonctionne pas, le système utilisera automatiquement RapidAPI comme fallback.

### Étapes :

1. Créez un compte sur https://rapidapi.com/
2. Allez sur https://rapidapi.com/omarbzd47/api/spotify-downloader9
3. Abonnez-vous au plan gratuit
4. Copiez votre clé API

5. **Ajouter dans .env.local**
   ```bash
   RAPIDAPI_KEY=votre_cle_rapidapi_ici
   ```

## Vérification

Pour tester si ça fonctionne :

1. Démarrez votre serveur : `npm run dev`
2. Ouvrez la recherche Spotify dans votre application
3. Cherchez une chanson (ex: "Jingle Bells")
4. Vous devriez voir des résultats avec les pochettes d'album

## Limites

### Spotify Web API (Client Credentials)
- ✅ **Gratuit**
- ✅ **Fiable**
- ✅ **Limite**: 100 requêtes par 30 secondes (largement suffisant)
- ❌ Ne donne pas accès aux playlists privées de l'utilisateur

### RapidAPI
- ⚠️ **Limité en plan gratuit**
- ⚠️ Peut avoir des latences
- ✅ Backup si Spotify API échoue

## Résolution de problèmes

### "Aucun résultat trouvé"
- Vérifiez que vos credentials sont bien dans `.env.local`
- Vérifiez que le serveur a été redémarré
- Regardez les logs du serveur pour voir les erreurs

### "Configuration serveur manquante"
- Les variables d'environnement ne sont pas configurées
- Ajoutez au minimum `SPOTIFY_CLIENT_ID` et `SPOTIFY_CLIENT_SECRET`

### Les pochettes d'album ne s'affichent pas
- Normal si l'album n'a pas d'image sur Spotify
- Vérifiez dans les logs si les données sont bien reçues
