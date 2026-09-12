import { z } from 'zod'
import type { AudioDifficulty, AudioValidationStatus, ValidatedAudioSample } from '@app/shared'

export type { AudioDifficulty, AudioValidationStatus, ValidatedAudioSample }

export type AudioSourceType = 'YOUTUBE' | 'DIRECT_FILE'

export const LLMValidationResultSchema = z.object({
  status: z
    .enum(['READY', 'REJECTED'])
    .describe(
      "Statut de validation : 'READY' si l'extrait est parfaitement adapté pour un concours de dictée en français (voix claire, un seul locuteur, pensée complète, pas de bruit excessif), sinon 'REJECTED'."
    ),
  rejectionReason: z
    .string()
    .optional()
    .describe(
      "Raison détaillée du rejet si status est 'REJECTED' (ex: locuteurs multiples, coupure en plein milieu d'une proposition, musique dominante, débit inintelligible, etc.)."
    ),
  singleSpeaker: z
    .boolean()
    .describe("Indique si un seul et unique locuteur s'exprime pendant tout l'extrait."),
  completeThought: z
    .boolean()
    .describe(
      "Indique si l'extrait audio forme une pensée, phrase ou groupe de phrases sémantiquement complet (début et fin naturels, non tronqué)."
    ),
  dictionQuality: z
    .enum(['EXCELLENTE', 'BONNE', 'MOYENNE', 'MAUVAISE'])
    .describe("Évaluation de la clarté de l'élocution, du timbre vocal et de l'articulation."),
  targetTranscript: z
    .string()
    .describe(
      "Transcription de référence (Ground Truth) rigoureusement vérifiée et corrigée : orthographe française irréprochable, accords grammaticaux parfaits, ponctuation complète (majuscules, virgules, points, tirets, etc.), accents et cédilles corrects."
    ),
  difficulty: z
    .enum(['FACILE', 'MOYEN', 'DIFFICILE'])
    .describe("Niveau de difficulté pour des joueurs de dictée"),
  topic: z
    .string()
    .describe("Thème ou sujet principal de l'extrait en un ou deux mots (ex: Histoire, Sciences, Littérature, Chronique, etc.)"),
  wordCount: z
    .number()
    .int()
    .describe('Nombre total de mots dans la transcription de référence (targetTranscript).')
})

export type LLMValidationResult = z.infer<typeof LLMValidationResultSchema>

export interface ProcessedAudioSegment {
  segmentIndex: number
  filePath: string
  durationSeconds: number
  startTimeSeconds: number
}

export interface CuratorPipelineOptions {
  sourceUrl: string
  sourceType?: AudioSourceType
  startTime?: number | string
  segmentDuration?: number
  maxSegments?: number
  outputDir?: string
  manifestPath?: string
  openAiApiKey?: string
  skipValidation?: boolean
  minDurationSeconds?: number
  maxDurationSeconds?: number
}

export interface CuratorPipelineResult {
  sourceUrl: string
  sourceType: AudioSourceType
  totalSegmentsProcessed: number
  readyCount: number
  rejectedCount: number
  samples: ValidatedAudioSample[]
}
