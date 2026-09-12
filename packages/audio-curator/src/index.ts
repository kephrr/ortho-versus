#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

// Run dotenv and parse ENV early
import './config.js';

import { downloadSource } from './services/downloader.js';
import { sliceAndNormalize } from './services/audioProcessor.js';
import { transcribe } from './services/localWhisper.js';
import { validateTranscript } from './services/deepseekValidator.js';
import { uploadAudio } from './services/r2Uploader.js';
import { saveToCatalog } from './services/catalog.js';

import type { ValidatedAudioSample, AudioValidationStatus, AudioDifficulty } from '@app/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.resolve(__dirname, '../temp');

function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

function cleanTempDir() {
  if (fs.existsSync(TEMP_DIR)) {
    console.log(`[Nettoyage] Suppression du dossier temp : ${TEMP_DIR}`);
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

const program = new Command();

program
  .name('curator')
  .description("CLI d'ingestion audio pour Ortho Versus. (Whisper Local + DeepSeek + R2)")
  .version('1.0.0');

program
  .command('process')
  .description('Traiter une source audio')
  .requiredOption('-u, --url <string>', 'URL YouTube ou lien MP3')
  .option('-d, --duration <number>', 'Durée cible en secondes (Défaut : 60, min : 45, max : 90)', '60')
  .option('-m, --max <number>', 'Nombre maximum de segments valides à extraire (Défaut : 2)', '2')
  .option('--dry-run', 'Exécuter sans téléverser sur R2 ni modifier le catalogue', false)
  .action(async (options) => {
    
    const targetDuration = Number(options.duration);
    if (isNaN(targetDuration) || targetDuration < 45 || targetDuration > 90) {
      console.error("[Erreur] La durée (-d) doit être comprise entre 45 et 90.");
      process.exit(1);
    }
    const maxSegments = Number(options.max);
    const dryRun = options.dryRun;
    
    let validCount = 0;

    try {
      ensureTempDir();
      
      const rawAudioPath = await downloadSource(options.url, TEMP_DIR);
      
      const segmentPaths = await sliceAndNormalize(rawAudioPath, targetDuration, TEMP_DIR);
      
      console.log(`\n[Process] ${segmentPaths.length} segments extraits. Traitement en cours... (Max : ${maxSegments})\n`);

      for (let i = 0; i < segmentPaths.length; i++) {
        if (validCount >= maxSegments) {
          console.log(`[Process] Limite maximale de ${maxSegments} segments valides atteinte. Fin.`);
          break;
        }

        const segmentPath = segmentPaths[i];
        console.log(`\n--- Traitement Segment ${i + 1}/${segmentPaths.length} ---`);

        try {
          const { rawText, duration } = await transcribe(segmentPath);
          console.log(`[Whisper] Durée: ${duration.toFixed(1)}s | Texte perçu: ${rawText.slice(0, 50)}...`);

          if (duration < 45 || duration > 90) {
            console.warn(`[Rejet] Écart de durée hors tolérance (45-90s). Durée réelle = ${duration}`);
            continue;
          }
          
          if (!rawText.trim()) {
            console.warn(`[Rejet] Transcription vide.`);
            continue;
          }

          const validation = await validateTranscript(rawText);

          if (!validation.isValid) {
            console.warn(`[Rejet DeepSeek] Raison : ${validation.rejectionReason || 'Non spécifiée par le modèle.'}`);
            continue;
          }

          console.log(`[Validation Succès] Niveau: ${validation.difficulty} | Mots: ${validation.wordCount}`);
          
          let publicUrl = 'http://localhost/dry-run.mp3';
          if (!dryRun) {
            const fileName = path.basename(segmentPath);
            publicUrl = await uploadAudio(segmentPath, fileName);
          } else {
            console.log(`[Dry Run] Upload R2 ignoré.`);
          }

          const sample: ValidatedAudioSample = {
            id: randomUUID(),
            sourceType: options.url.includes('youtube.com') || options.url.includes('youtu.be') ? 'YOUTUBE' : 'DIRECT_FILE',
            sourceUrl: options.url,
            audioR2Url: publicUrl,
            durationSeconds: Math.round(duration),
            targetTranscript: validation.targetTranscript!,
            wordCount: validation.wordCount || 0,
            difficulty: (validation.difficulty || 'MOYEN') as AudioDifficulty,
            topic: validation.topic || 'Général',
            status: 'READY' as AudioValidationStatus,
            createdAt: new Date().toISOString()
          };

          if (!dryRun) {
            // "en évitant les doublons" on va check si un même transcript a deja été push par exemple
            // mais saveToCatalog va juste ajouter
            saveToCatalog(sample);
          } else {
            console.log(`[Dry Run] Sauvegarde au catalogue ignorée. Aperçu :`, sample);
          }

          validCount++;
        } catch (err: unknown) {
          console.error(`[Erreur Segment ${i + 1}] :`, err instanceof Error ? err.message : String(err));
          // Continuer sur le segment suivant
        }
      }

      console.log(`\n[Bilan] Opération terminée. ${validCount} segments valides obtenus.`);

    } catch (e: unknown) {
      console.error(`\n[Erreur Fatale] : ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      cleanTempDir();
    }
  });

program.parse(process.argv);
