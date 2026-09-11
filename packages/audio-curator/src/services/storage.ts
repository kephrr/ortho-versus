import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import type { ValidatedAudioSample } from '../types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class StorageService {
  private outputDir: string
  private manifestPath: string
  private seederDataPath: string

  constructor(customOutputDir?: string, customManifestPath?: string) {
    // Default to apps/backend/public/uploads/audio
    const defaultBackendDir = path.resolve(
      __dirname,
      '../../../../apps/backend/public/uploads/audio'
    )
    this.outputDir = customOutputDir || defaultBackendDir
    this.manifestPath =
      customManifestPath || path.join(this.outputDir, 'samples.json')

    // Also mirror to apps/backend/database/data/audio_samples.json for AdonisJS seeders
    this.seederDataPath = path.resolve(
      __dirname,
      '../../../../apps/backend/database/data/audio_samples.json'
    )
  }

  getOutputDir(): string {
    return this.outputDir
  }

  getManifestPath(): string {
    return this.manifestPath
  }

  /**
   * Ensures necessary directories exist.
   */
  ensureDirectories(): void {
    fs.mkdirSync(this.outputDir, { recursive: true })
    const seederDir = path.dirname(this.seederDataPath)
    fs.mkdirSync(seederDir, { recursive: true })
  }

  /**
   * Loads the existing manifest of samples.
   */
  async loadManifest(): Promise<ValidatedAudioSample[]> {
    if (!fs.existsSync(this.manifestPath)) {
      return []
    }
    try {
      const content = fs.readFileSync(this.manifestPath, 'utf-8')
      return JSON.parse(content) as ValidatedAudioSample[]
    } catch {
      return []
    }
  }

  /**
   * Saves or updates a validated audio sample, copies the audio file and updates the manifest.
   */
  async saveSample(params: {
    tempAudioPath: string
    sourceType: ValidatedAudioSample['sourceType']
    sourceUrl: string
    durationSeconds: number
    targetTranscript: string
    difficulty: ValidatedAudioSample['difficulty']
    status: ValidatedAudioSample['status']
    rejectionReason?: string
    wordCount: number
  }): Promise<ValidatedAudioSample> {
    this.ensureDirectories()

    const id = randomUUID()
    const audioFileName = `sample_${id}.mp3`
    const targetAudioPath = path.join(this.outputDir, audioFileName)

    // Copy audio file to destination
    fs.copyFileSync(params.tempAudioPath, targetAudioPath)

    const newSample: ValidatedAudioSample = {
      id,
      sourceType: params.sourceType,
      sourceUrl: params.sourceUrl,
      audioFileName,
      durationSeconds: params.durationSeconds,
      targetTranscript: params.targetTranscript,
      difficulty: params.difficulty,
      status: params.status,
      rejectionReason: params.rejectionReason,
      wordCount: params.wordCount,
      createdAt: new Date().toISOString(),
    }

    // Update manifest
    const manifest = await this.loadManifest()
    manifest.push(newSample)
    fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')

    // Also update AdonisJS seeder data
    try {
      fs.writeFileSync(this.seederDataPath, JSON.stringify(manifest, null, 2), 'utf-8')
    } catch (err) {
      console.warn(`[StorageService] Note: impossible d'écrire dans ${this.seederDataPath}:`, err)
    }

    console.log(`[StorageService] Échantillon sauvegardé : ${audioFileName} (ID: ${id})`)
    return newSample
  }

  /**
   * Returns statistics about saved audio samples.
   */
  async getStats(): Promise<{
    total: number
    ready: number
    rejected: number
    totalDurationSeconds: number
    byDifficulty: Record<string, number>
  }> {
    const manifest = await this.loadManifest()

    const stats = {
      total: manifest.length,
      ready: 0,
      rejected: 0,
      totalDurationSeconds: 0,
      byDifficulty: {
        FACILE: 0,
        MOYEN: 0,
        DIFFICILE: 0,
      },
    }

    for (const sample of manifest) {
      if (sample.status === 'READY') {
        stats.ready++
        stats.totalDurationSeconds += sample.durationSeconds
        stats.byDifficulty[sample.difficulty] =
          (stats.byDifficulty[sample.difficulty] || 0) + 1
      } else {
        stats.rejected++
      }
    }

    stats.totalDurationSeconds = Math.round(stats.totalDurationSeconds * 10) / 10
    return stats
  }
}
