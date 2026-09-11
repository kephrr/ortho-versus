import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { randomUUID } from 'node:crypto'
import { AudioDownloader } from './audio-downloader.js'
import { AudioProcessor } from './audio-processor.js'
import { TranscriptionService } from './transcription.js'
import { SemanticValidator } from './semantic-validator.js'
import { StorageService } from './storage.js'
import type {
  CuratorPipelineOptions,
  CuratorPipelineResult,
  ValidatedAudioSample,
} from '../types.js'

export class CuratorPipeline {
  private downloader: AudioDownloader
  private processor: AudioProcessor
  private transcription: TranscriptionService
  private validator: SemanticValidator
  private storage: StorageService

  constructor(options?: {
    outputDir?: string
    manifestPath?: string
    openAiApiKey?: string
  }) {
    this.downloader = new AudioDownloader()
    this.processor = new AudioProcessor()
    this.transcription = new TranscriptionService(options?.openAiApiKey)
    this.validator = new SemanticValidator(options?.openAiApiKey)
    this.storage = new StorageService(options?.outputDir, options?.manifestPath)
  }

  /**
   * Executes the complete audio curation and validation pipeline.
   */
  async run(options: CuratorPipelineOptions): Promise<CuratorPipelineResult> {
    const runId = randomUUID()
    const tempWorkDir = path.join(os.tmpdir(), `audio_curator_${runId}`)
    fs.mkdirSync(tempWorkDir, { recursive: true })

    const samples: ValidatedAudioSample[] = []
    const resolvedType =
      options.sourceType || AudioDownloader.detectSourceType(options.sourceUrl)

    console.log(`\n======================================================`)
    console.log(`[CuratorPipeline] Démarrage du pipeline d'ingestion audio`)
    console.log(`- Source : ${options.sourceUrl}`)
    console.log(`- Type détecté : ${resolvedType}`)
    console.log(`- Dossier temporaire : ${tempWorkDir}`)
    console.log(`======================================================\n`)

    try {
      // 1. Download source audio
      console.log(`[Étape 1/4] Téléchargement / Récupération du fichier source...`)
      const downloadResult = await this.downloader.download(
        options.sourceUrl,
        tempWorkDir,
        resolvedType
      )

      // 2. Process & Segment with FFmpeg
      console.log(`\n[Étape 2/4] Découpage et normalisation audio (ffmpeg loudnorm)...`)
      const segments = await this.processor.normalizeAndSegment({
        inputPath: downloadResult.audioPath,
        outputDir: path.join(tempWorkDir, 'segments'),
        startTime: options.startTime,
        segmentDuration: options.segmentDuration || 40,
        maxSegments: options.maxSegments || 1,
        minDuration: options.minDurationSeconds || 30,
      })

      console.log(`[CuratorPipeline] ${segments.length} segment(s) extrait(s) avec succès.`)

      // 3. Transcribe, Validate & Store each segment
      console.log(`\n[Étape 3/4] Transcription IA & Validation sémantique...`)
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]
        console.log(`\n--- Analyse du segment ${i + 1}/${segments.length} (${seg.durationSeconds}s) ---`)

        if (options.skipValidation) {
          console.log(`[CuratorPipeline] Mode sans validation activé (--skip-validation).`)
          const saved = await this.storage.saveSample({
            tempAudioPath: seg.filePath,
            sourceType: resolvedType,
            sourceUrl: options.sourceUrl,
            durationSeconds: seg.durationSeconds,
            targetTranscript: 'Transcription brute non validée (mode direct).',
            difficulty: 'MOYEN',
            status: 'READY',
            wordCount: 7,
          })
          samples.push(saved)
          continue
        }

        // 3a. Whisper Transcription
        const transResult = await this.transcription.transcribe(
          seg.filePath,
          options.openAiApiKey
        )

        if (!transResult.transcript || transResult.transcript.length < 10) {
          console.warn(`[CuratorPipeline] Extrait silencieux ou inaudible rejeté.`)
          const saved = await this.storage.saveSample({
            tempAudioPath: seg.filePath,
            sourceType: resolvedType,
            sourceUrl: options.sourceUrl,
            durationSeconds: seg.durationSeconds,
            targetTranscript: transResult.transcript || '',
            difficulty: 'FACILE',
            status: 'REJECTED',
            rejectionReason: 'Extrait inaudible ou sans paroles identifiées.',
            wordCount: 0,
          })
          samples.push(saved)
          continue
        }

        // 3b. LLM Validation & Ground Truth Correction
        const validation = await this.validator.validate(
          transResult.transcript,
          options.openAiApiKey
        )

        // 4. Save to destination storage
        const saved = await this.storage.saveSample({
          tempAudioPath: seg.filePath,
          sourceType: resolvedType,
          sourceUrl: options.sourceUrl,
          durationSeconds: seg.durationSeconds,
          targetTranscript: validation.targetTranscript,
          difficulty: validation.difficulty,
          status: validation.status,
          rejectionReason: validation.rejectionReason,
          wordCount: validation.wordCount,
        })

        samples.push(saved)
      }

      const readyCount = samples.filter((s) => s.status === 'READY').length
      const rejectedCount = samples.filter((s) => s.status === 'REJECTED').length

      console.log(`\n======================================================`)
      console.log(`[CuratorPipeline] Pipeline terminé avec succès !`)
      console.log(`- Prêts pour le jeu : ${readyCount}`)
      console.log(`- Rejetés : ${rejectedCount}`)
      console.log(`- Dossier stockage : ${this.storage.getOutputDir()}`)
      console.log(`- Manifeste : ${this.storage.getManifestPath()}`)
      console.log(`======================================================\n`)

      return {
        sourceUrl: options.sourceUrl,
        sourceType: resolvedType,
        totalSegmentsProcessed: segments.length,
        readyCount,
        rejectedCount,
        samples,
      }
    } finally {
      // Clean up temp files
      try {
        if (fs.existsSync(tempWorkDir)) {
          fs.rmSync(tempWorkDir, { recursive: true, force: true })
        }
      } catch (cleanupErr) {
        console.warn(`[CuratorPipeline] Nettoyage temporaire impossible :`, cleanupErr)
      }
    }
  }
}
