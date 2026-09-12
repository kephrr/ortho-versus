export type RoomStatus = 'LOBBY' | 'STARTING' | 'PLAYING' | 'EVALUATING' | 'FINISHED'

export interface Player {
  id: string
  socketId: string
  nickname: string
  avatar: string
  isHost: boolean
}

export interface RoomState {
  code: string
  status: RoomStatus
  maxPlayers: number
  players: Player[]
  audioDurationSeconds: number
  audioUrl?: string
}

export interface PlayerResult {
  playerId: string
  nickname: string
  avatar: string
  wordErrorCount: number
  accuracyScore: number
  submittedText: string
}

export interface GameResultsPayload {
  targetTranscript: string
  results: PlayerResult[]
}

export type AudioDifficulty = 'FACILE' | 'MOYEN' | 'DIFFICILE'
export type AudioValidationStatus = 'READY' | 'REJECTED'

export interface ValidatedAudioSample {
  id: string
  sourceType: 'YOUTUBE' | 'DIRECT_FILE'
  sourceUrl: string
  audioR2Url: string
  durationSeconds: number
  targetTranscript: string
  wordCount: number
  difficulty: AudioDifficulty
  topic: string
  status: AudioValidationStatus
  rejectionReason?: string
  createdAt: string
}
