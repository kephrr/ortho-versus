import type {
  Player,
  RoomState,
  RoomStatus,
  GameResultsPayload,
  PlayerResult,
} from '@app/shared'
import { evaluateSubmission } from '@app/shared'

export interface ServerRoom {
  code: string
  status: RoomStatus
  maxPlayers: number
  players: Player[]
  audioDurationSeconds: number
  targetTranscript: string
  audioUrl: string
  submissions: Map<string, string> // playerId -> text
}

class RoomManager {
  private rooms = new Map<string, ServerRoom>()
  private socketToRoom = new Map<string, { roomCode: string; playerId: string }>()

  // Sample spelling challenges
  private sampleChallenges = [
    {
      transcript: 'Les ornithorynques nagent paisiblement dans la rivière scintillante.',
      audioUrl: '/audios/video_extrait_45s.mp3',
      duration: 45,
    },
    {
      transcript: 'L’anticonstitutionnellement long discours a captivé toute l’assemblée.',
      audioUrl: '/audios/video_extrait_45s.mp3',
      duration: 45,
    },
    {
      transcript: 'Des chrysalides mystérieuses émergent de merveilleux papillons diaprés.',
      audioUrl: '/audios/video_extrait_45s.mp3',
      duration: 45,
    },
  ]

  public getOrCreateRoom(code: string): ServerRoom {
    const normalizedCode = code.trim().toUpperCase()
    let room = this.rooms.get(normalizedCode)

    if (!room) {
      const randomChallenge =
        this.sampleChallenges[Math.floor(Math.random() * this.sampleChallenges.length)]

      room = {
        code: normalizedCode,
        status: 'LOBBY',
        maxPlayers: 8,
        players: [],
        audioDurationSeconds: randomChallenge.duration,
        targetTranscript: randomChallenge.transcript,
        audioUrl: randomChallenge.audioUrl,
        submissions: new Map(),
      }
      this.rooms.set(normalizedCode, room)
    }

    return room
  }

  public getRoom(code: string): ServerRoom | undefined {
    return this.rooms.get(code.trim().toUpperCase())
  }

  public getPublicState(room: ServerRoom): RoomState {
    return {
      code: room.code,
      status: room.status,
      maxPlayers: room.maxPlayers,
      players: room.players,
      audioDurationSeconds: room.audioDurationSeconds,
    }
  }

  public addPlayer(
    code: string,
    socketId: string,
    nickname: string,
    avatar: string
  ): { room: ServerRoom; player: Player } {
    const room = this.getOrCreateRoom(code)

    // Remove existing association for this socket if any
    this.removeSocket(socketId)

    const isHost = room.players.length === 0
    const playerId = `p_${Math.random().toString(36).substring(2, 9)}`

    const player: Player = {
      id: playerId,
      socketId,
      nickname,
      avatar: avatar || '🦊',
      isHost,
    }

    room.players.push(player)
    this.socketToRoom.set(socketId, { roomCode: room.code, playerId })

    return { room, player }
  }

  public removeSocket(socketId: string): { room?: ServerRoom; removedPlayer?: Player } {
    const mapping = this.socketToRoom.get(socketId)
    if (!mapping) return {}

    this.socketToRoom.delete(socketId)
    const room = this.rooms.get(mapping.roomCode)
    if (!room) return {}

    const playerIndex = room.players.findIndex((p) => p.socketId === socketId)
    if (playerIndex === -1) return { room }

    const [removedPlayer] = room.players.splice(playerIndex, 1)

    // If host left and other players remain, assign new host
    if (removedPlayer.isHost && room.players.length > 0) {
      room.players[0].isHost = true
    }

    // Clean up empty room after 5 minutes of inactivity if desired
    if (room.players.length === 0) {
      this.rooms.delete(room.code)
    }

    return { room, removedPlayer }
  }

  public getSocketInfo(socketId: string) {
    return this.socketToRoom.get(socketId)
  }

  public submitInput(code: string, playerId: string, text: string): boolean {
    const room = this.getRoom(code)
    if (!room) return false
    room.submissions.set(playerId, text)
    return true
  }

  public evaluateRoom(code: string): GameResultsPayload | null {
    const room = this.getRoom(code)
    if (!room) return null

    const results: PlayerResult[] = room.players.map((player) => {
      const submittedText = room.submissions.get(player.id) || ''
      const { wordErrorCount, accuracyScore } = evaluateSubmission(
        room.targetTranscript,
        submittedText
      )

      return {
        playerId: player.id,
        nickname: player.nickname,
        avatar: player.avatar,
        wordErrorCount,
        accuracyScore,
        submittedText,
      }
    })

    // Sort by highest accuracy, then lowest errors
    results.sort((a, b) => b.accuracyScore - a.accuracyScore || a.wordErrorCount - b.wordErrorCount)

    return {
      targetTranscript: room.targetTranscript,
      results,
    }
  }
}

export const roomManager = new RoomManager()
