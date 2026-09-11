#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import dotenv from 'dotenv'
import { CuratorPipeline } from './services/curator-pipeline.js'
import { StorageService } from './services/storage.js'
import type { AudioSourceType } from './types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. Automatically load .env from multiple potential locations
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../../apps/backend/.env'),
  path.resolve(__dirname, '../../../../apps/backend/.env'),
]

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
  }
}

const program = new Command()

program
  .name('audio-curator')
  .description("Outil CLI d'ingestion, normalisation et validation IA d'extraits audio pour Ortho Versus")
  .version('0.0.1')

// --- Command: process ---
program
  .command('process')
  .description("Ingère et valide un extrait audio depuis YouTube, un flux RSS podcast ou un fichier direct")
  .argument('<source>', 'URL YouTube, URL de flux RSS/podcast, URL directe MP3 ou chemin de fichier local')
  .option(
    '-t, --type <type>',
    'Type de source explicite (YOUTUBE, PODCAST, DIRECT_FILE). Détecté automatiquement si omis.'
  )
  .option('-s, --start <time>', 'Décalage de début (ex: 00:01:30 ou 90 en secondes)')
  .option('-d, --duration <seconds>', 'Durée cible du segment en secondes (défaut: 40, entre 30 et 90)', '40')
  .option('-m, --max-segments <number>', 'Nombre maximal de segments à extraire et valider', '1')
  .option('-o, --output-dir <path>', 'Répertoire de stockage de sortie (défaut: apps/backend/public/uploads/audio)')
  .option('-k, --openai-key <key>', 'Clé API OpenAI (ou variable OPENAI_API_KEY)')
  .option('--skip-validation', 'Ignorer la validation Whisper et GPT (utile pour tester sans coût API)', false)
  .option('--json', 'Afficher le résultat au format JSON brut', false)
  .action(async (source, options) => {
    try {
      const pipeline = new CuratorPipeline({
        outputDir: options.outputDir,
        openAiApiKey: options.openaiKey,
      })

      const duration = Number(options.duration) || 40
      const maxSegments = Number(options.maxSegments) || 1

      const result = await pipeline.run({
        sourceUrl: source,
        sourceType: options.type ? (options.type.toUpperCase() as AudioSourceType) : undefined,
        startTime: options.start,
        segmentDuration: duration,
        maxSegments,
        outputDir: options.outputDir,
        openAiApiKey: options.openaiKey,
        skipValidation: Boolean(options.skipValidation),
      })

      if (options.json) {
        console.log(JSON.stringify(result, null, 2))
      }
    } catch (err: unknown) {
      console.error(
        `\n[ERREUR] Échec du pipeline : ${err instanceof Error ? err.message : String(err)}`
      )
      process.exit(1)
    }
  })

// --- Command: list ---
program
  .command('list')
  .description('Affiche la liste des extraits audio enregistrés dans le manifeste')
  .option('-o, --output-dir <path>', 'Répertoire de stockage (défaut: apps/backend/public/uploads/audio)')
  .action(async (options) => {
    try {
      const storage = new StorageService(options.outputDir)
      const samples = await storage.loadManifest()

      if (samples.length === 0) {
        console.log(`Aucun échantillon audio enregistré dans ${storage.getManifestPath()}`)
        return
      }

      console.log(`\nÉchantillons audio enregistrés (${samples.length}) :`)
      console.log('='.repeat(80))
      for (const s of samples) {
        const badge = s.status === 'READY' ? '[READY]' : '[REJECTED]'
        console.log(`${badge} ID: ${s.id} | Fichier: ${s.audioFileName} | ${s.durationSeconds}s | ${s.difficulty}`)
        console.log(`  Mots (${s.wordCount}) : "${s.targetTranscript.slice(0, 70)}..."`)
        if (s.rejectionReason) {
          console.log(`  Raison du rejet : ${s.rejectionReason}`)
        }
        console.log('-'.repeat(80))
      }
    } catch (err: unknown) {
      console.error(`Erreur : ${err instanceof Error ? err.message : String(err)}`)
      process.exit(1)
    }
  })

// --- Command: stats ---
program
  .command('stats')
  .description('Affiche les statistiques globales de la bibliothèque audio')
  .option('-o, --output-dir <path>', 'Répertoire de stockage (défaut: apps/backend/public/uploads/audio)')
  .action(async (options) => {
    try {
      const storage = new StorageService(options.outputDir)
      const stats = await storage.getStats()

      console.log('\n--- Statistiques Ortho Versus Audio Curator ---')
      console.log(`Total échantillons : ${stats.total}`)
      console.log(`Prêts pour le jeu : ${stats.ready}`)
      console.log(`Rejetés : ${stats.rejected}`)
      console.log(`Durée cumulée (prêts) : ${stats.totalDurationSeconds}s (~${(stats.totalDurationSeconds / 60).toFixed(1)} min)`)
      console.log('Répartition par difficulté :')
      console.log(`  - Facile : ${stats.byDifficulty.FACILE}`)
      console.log(`  - Moyen : ${stats.byDifficulty.MOYEN}`)
      console.log(`  - Difficile : ${stats.byDifficulty.DIFFICILE}`)
      console.log('--------------------------------------------\n')
    } catch (err: unknown) {
      console.error(`Erreur : ${err instanceof Error ? err.message : String(err)}`)
      process.exit(1)
    }
  })

// --- Command: batch ---
program
  .command('batch')
  .description('Traite une liste d’URLs contenues dans un fichier texte (une URL par ligne)')
  .argument('<filePath>', 'Chemin du fichier texte contenant les URLs')
  .option('-d, --duration <seconds>', 'Durée par segment (défaut: 40)', '40')
  .option('-o, --output-dir <path>', 'Répertoire de stockage')
  .option('--skip-validation', 'Ignorer la validation IA', false)
  .action(async (filePath, options) => {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Fichier introuvable : ${filePath}`)
      }

      const content = fs.readFileSync(filePath, 'utf-8')
      const urls = content
        .split(/\r?\n/)
        .map((u) => u.trim())
        .filter((u) => u && !u.startsWith('#'))

      console.log(`[Batch] ${urls.length} URLs à traiter depuis ${filePath}`)

      const pipeline = new CuratorPipeline({ outputDir: options.outputDir })

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        console.log(`\n>>> Traitement URL ${i + 1}/${urls.length} : ${url}`)
        try {
          await pipeline.run({
            sourceUrl: url,
            segmentDuration: Number(options.duration) || 40,
            outputDir: options.outputDir,
            skipValidation: Boolean(options.skipValidation),
          })
        } catch (err) {
          console.error(`Échec sur ${url} :`, err)
        }
      }
    } catch (err: unknown) {
      console.error(`Erreur batch : ${err instanceof Error ? err.message : String(err)}`)
      process.exit(1)
    }
  })

program.parse(process.argv)
