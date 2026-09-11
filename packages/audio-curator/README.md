# @app/audio-curator

Service et outil CLI d'ingestion, de découpage, de normalisation et de validation sémantique d'extraits audio pour le jeu **Ortho Versus** (concours multijoueur de dictée en temps réel).

---

## Fonctionnalités

1. **Ingestion Multi-Sources** :
   - **YouTube** : Téléchargement et extraction audio via `yt-dlp` (`yt-dlp-exec` avec détection système ou téléchargement autonome).
   - **Podcasts RSS** : Détection des épisodes et téléchargement direct du flux audio MP3.
   - **Fichiers Directs** : URLs distantes ou fichiers locaux.

2. **Traitement & Normalisation Audio (`ffmpeg`)** :
   - Découpage précis en segments calibrés (30 à 90 secondes, par défaut 40s).
   - Détection et décalage d'offset (ex: sauter les intros musicales de podcasts).
   - Conversion en mono 44.1 kHz 128 kbps (`libmp3lame`).
   - Normalisation du volume sonore broadcast avec le filtre `loudnorm` (EBU R128).

3. **Transcription Haute Fidélité (`OpenAI Whisper-1`)** :
   - Transcription brute en français avec ponctuation et minutage.

4. **Validation Sémantique & Orthographique (`OpenAI GPT-4o-mini`)** :
   - Structured Outputs garantissant la conformité stricte au schéma JSON.
   - Vérification de l'unicité du locuteur (pas de dialogues qui se chevauchent).
   - Validation de la complétude de la pensée (début et fin de phrase naturels, pas de troncature).
   - Génération du **Ground Truth** (`targetTranscript`) : orthographe, grammaire, accords et ponctuation parfaits.
   - Classification automatique du niveau de difficulté : `FACILE`, `MOYEN`, `DIFFICILE`.
   - Statut `READY` ou `REJECTED` avec justification détaillée (`rejectionReason`).

5. **Stockage & Intégration AdonisJS** :
   - Sauvegarde des audios validés dans `apps/backend/public/uploads/audio/sample_[id].mp3`.
   - Mise à jour du manifeste `samples.json`.
   - Export automatique vers `apps/backend/database/data/audio_samples.json` pour alimenter les seeders de la base de données.

---

## Prérequis

- **Node.js** >= 20
- **FFmpeg** installé sur la machine et accessible dans le PATH (ou via Winget sur Windows).
- **Clé API OpenAI** (`OPENAI_API_KEY`) définie dans votre environnement ou dans `apps/backend/.env`.

---

## Utilisation en Ligne de Commande (CLI)

Depuis la racine du monorepo :

### 1. Ingérer et valider une source audio

```bash
# Depuis une vidéo YouTube
pnpm curate process "https://www.youtube.com/watch?v=..." --duration 45

# En spécifiant un point de départ précis (ex: à 1 min 30 s)
pnpm curate process "https://www.youtube.com/watch?v=..." --start 00:01:30 --duration 40

# Depuis un flux RSS de podcast (extrait les premiers segments)
pnpm curate process "https://radiofrance-podcast.net/podcast09/rss_12345.xml" --max-segments 3

# Depuis un fichier local ou URL directe
pnpm curate process "./mon_enregistrement.mp3" --duration 40

# Mode test sans appel aux APIs OpenAI (--skip-validation)
pnpm curate process "./extrait.mp3" --skip-validation
```

### 2. Lister les extraits enregistrés

```bash
pnpm curate list
```

### 3. Consulter les statistiques de la bibliothèque

```bash
pnpm curate stats
```

### 4. Traitement par lot (Batch)

```bash
pnpm curate batch urls.txt --duration 45
```

---

## Utilisation Programmatique

```typescript
import { CuratorPipeline } from '@app/audio-curator'

const pipeline = new CuratorPipeline()

const result = await pipeline.run({
  sourceUrl: 'https://www.youtube.com/watch?v=...',
  startTime: '00:02:00',
  segmentDuration: 45,
  maxSegments: 1,
})

console.log(`Échantillons prêts : ${result.readyCount}`)
```
