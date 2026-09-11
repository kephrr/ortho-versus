import fs from 'node:fs'
import { OpenAI } from 'openai'

export interface TranscriptionResult {
  transcript: string
  durationSeconds?: number
  language?: string
}

export class TranscriptionService {
  private client: OpenAI | null = null

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY
    if (key) {
      this.client = new OpenAI({ apiKey: key })
    }
  }

  private getClient(overrideKey?: string): OpenAI {
    if (overrideKey) {
      return new OpenAI({ apiKey: overrideKey })
    }
    if (this.client) {
      return this.client
    }
    const envKey = process.env.OPENAI_API_KEY
    if (!envKey) {
      throw new Error(
        'OPENAI_API_KEY manquant. Définissez la variable OPENAI_API_KEY dans votre environnement ou passez-la en option.'
      )
    }
    this.client = new OpenAI({ apiKey: envKey })
    return this.client
  }

  /**
   * Transcribes an audio segment using OpenAI Whisper API in French.
   */
  async transcribe(audioFilePath: string, apiKey?: string): Promise<TranscriptionResult> {
    const openai = this.getClient(apiKey)

    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Fichier audio introuvable pour la transcription : ${audioFilePath}`)
    }

    console.log(`[TranscriptionService] Transcription Whisper de ${audioFilePath}...`)

    const fileStream = fs.createReadStream(audioFilePath)

    const response = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      language: 'fr',
      response_format: 'verbose_json',
      temperature: 0,
    })

    const transcript = response.text.trim()
    const durationSeconds = response.duration ? Number(response.duration) : undefined
    const language = response.language || 'fr'

    console.log(`[TranscriptionService] Transcription terminée (${transcript.length} caractères)`)

    return {
      transcript,
      durationSeconds,
      language,
    }
  }
}
