import type { GameResultsPayload, RoomState } from './types.js'

export interface ClientToServerEvents {
  'room:join': (data: { roomCode: string; nickname: string; avatar: string }) => void
  'room:start': (data: { roomCode: string }) => void
  'game:submit_input': (data: { roomCode: string; text: string }) => void
}

export interface ServerToClientEvents {
  'room:state_sync': (state: RoomState) => void
  'room:error': (message: string) => void
  'game:countdown': (secondsLeft: number) => void
  'game:started': (payload: { audioUrl: string; durationSeconds: number }) => void
  'game:results': (payload: GameResultsPayload) => void
}
