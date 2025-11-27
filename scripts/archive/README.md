# Scripts Archivés

Ce dossier contient des scripts qui ne sont plus activement utilisés mais qui peuvent être utiles pour référence.

## fetch-christmas-mp3.js

**Date d'archivage:** 2025-11-27
**Raison:** Script one-shot qui a été exécuté manuellement pour télécharger des MP3 de chansons de Noël via RapidAPI.

**Usage historique:** Télécharger des chansons de Noël pour les tests de l'application.

**ATTENTION SÉCURITÉ:**
- Ce script contient une clé API RapidAPI hardcodée qui a été exposée dans le code
- La clé API doit être révoquée: `b679619f29msh06e0c950d671f54p1e1c68jsn8c1b53ab95bd`
- Ne jamais réutiliser ce script sans remplacer la clé par une variable d'environnement

**Recommandation:**
Si ce script doit être réutilisé, utiliser des variables d'environnement pour les clés API:
```javascript
const apiKey = process.env.RAPIDAPI_KEY;
```
