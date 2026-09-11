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
  sourceType: 'YOUTUBE' | 'PODCAST' | 'DIRECT_FILE'
  sourceUrl: string
  audioFileName: string
  durationSeconds: number
  targetTranscript: string
  difficulty: AudioDifficulty
  status: AudioValidationStatus
  rejectionReason?: string
  wordCount: number
  createdAt: string
}
