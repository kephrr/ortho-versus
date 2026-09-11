import app from '@adonisjs/core/services/app'
import server from '@adonisjs/core/services/server'
import { Server } from 'socket.io'
import type { ClientToServerEvents, ServerToClientEvents } from '@app/shared'
import { roomManager } from '#services/room_manager'

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null

export function getWsServer() {
  return io
}

app.ready(() => {
  const nodeServer = server.getNodeServer()
  if (!nodeServer) {
    console.error('[WebSocket] Node HTTP server not available')
    return
  }

  io = new Server<ClientToServerEvents, ServerToClientEvents>(nodeServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  console.log('[WebSocket] Socket.io server initialized successfully')

  io.on('connection', (socket) => {
    // 1. Join Room
    socket.on('room:join', ({ roomCode, nickname, avatar }) => {
      const trimmedCode = (roomCode || '').trim().toUpperCase()
      if (!trimmedCode || !nickname) {
        socket.emit('room:error', 'Le code de salon et le pseudo sont obligatoires.')
        return
      }

      const { room } = roomManager.addPlayer(trimmedCode, socket.id, nickname, avatar)
      socket.join(room.code)

      // Sync state with all players in room
      io?.to(room.code).emit('room:state_sync', roomManager.getPublicState(room))
    })

    // 2. Start Room Game (Host Only)
    socket.on('room:start', ({ roomCode }) => {
      const room = roomManager.getRoom(roomCode)
      if (!room) {
        socket.emit('room:error', 'Salon introuvable.')
        return
      }

      const player = room.players.find((p) => p.socketId === socket.id)
      if (!player?.isHost) {
        socket.emit('room:error', 'Seul l’hôte peut lancer la partie.')
        return
      }

      if (room.status !== 'LOBBY' && room.status !== 'FINISHED') {
        socket.emit('room:error', 'La partie est déjà en cours.')
        return
      }

      room.status = 'STARTING'
      room.submissions.clear()
      io?.to(room.code).emit('room:state_sync', roomManager.getPublicState(room))

      // 5-second countdown to allow audio preloading
      let countdown = 5
      io?.to(room.code).emit('game:countdown', countdown)

      const countdownInterval = setInterval(() => {
        countdown--
        if (countdown > 0) {
          io?.to(room.code).emit('game:countdown', countdown)
        } else {
          clearInterval(countdownInterval)

          // Game starts!
          room.status = 'PLAYING'
          io?.to(room.code).emit('room:state_sync', roomManager.getPublicState(room))
          io?.to(room.code).emit('game:started', {
            audioUrl: room.audioUrl,
            durationSeconds: room.audioDurationSeconds,
          })

          // Set timeout for game end
          setTimeout(() => {
            room.status = 'EVALUATING'
            io?.to(room.code).emit('room:state_sync', roomManager.getPublicState(room))

            const results = roomManager.evaluateRoom(room.code)
            if (results) {
              io?.to(room.code).emit('game:results', results)
            }

            room.status = 'FINISHED'
            io?.to(room.code).emit('room:state_sync', roomManager.getPublicState(room))
          }, room.audioDurationSeconds * 1000)
        }
      }, 1000)
    })

    // 3. Player Submits Input
    socket.on('game:submit_input', ({ roomCode, text }) => {
      const socketInfo = roomManager.getSocketInfo(socket.id)
      if (!socketInfo) return

      roomManager.submitInput(roomCode, socketInfo.playerId, text)
    })

    // 4. Disconnect
    socket.on('disconnect', () => {
      const { room } = roomManager.removeSocket(socket.id)
      if (room) {
        io?.to(room.code).emit('room:state_sync', roomManager.getPublicState(room))
      }
    })
  })
})
