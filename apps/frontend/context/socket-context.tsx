'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  RoomState,
  GameResultsPayload,
} from '@app/shared'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3333'

interface SocketContextValue {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null
  roomState: RoomState | null
  countdown: number | null
  gameAudio: { url: string; duration: number } | null
  results: GameResultsPayload | null
  error: string | null
  currentPlayerNickname: string
  audioPreloaded: boolean
  joinRoom: (roomCode: string, nickname: string, avatar: string) => void
  startRoom: () => void
  submitInput: (text: string) => void
  clearError: () => void
  resetGame: () => void
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [gameAudio, setGameAudio] = useState<{ url: string; duration: number } | null>(null)
  const [results, setResults] = useState<GameResultsPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPlayerNickname, setCurrentPlayerNickname] = useState<string>('')
  const [audioPreloaded, setAudioPreloaded] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const s: Socket<ServerToClientEvents, ClientToServerEvents> = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    s.on('room:state_sync', (state) => {
      setRoomState(state)
      if (state.status === 'LOBBY') {
        setResults(null)
        setCountdown(null)
        setGameAudio(null)
      }
    })

    s.on('room:error', (msg) => {
      setError(msg)
    })

    s.on('game:countdown', (secondsLeft) => {
      setCountdown(secondsLeft)
    })

    s.on('game:started', (payload) => {
      setCountdown(null)
      setGameAudio({ url: payload.audioUrl, duration: payload.durationSeconds })

      // Play the preloaded audio immediately
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((err) => {
          console.warn('[Audio] Autoplay blocked, user interaction required:', err)
        })
      }
    })

    s.on('game:results', (payload) => {
      setResults(payload)
      if (audioRef.current) {
        audioRef.current.pause()
      }
    })

    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [])

  // Audio preloader when countdown or starting begins
  useEffect(() => {
    if (roomState?.status === 'STARTING') {
      // Pre-warm audio element
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }
      setAudioPreloaded(true)
    }
  }, [roomState?.status])

  const joinRoom = (roomCode: string, nickname: string, avatar: string) => {
    if (!socket) return
    setCurrentPlayerNickname(nickname)
    socket.emit('room:join', { roomCode, nickname, avatar })
  }

  const startRoom = () => {
    if (!socket || !roomState) return
    socket.emit('room:start', { roomCode: roomState.code })
  }

  const submitInput = (text: string) => {
    if (!socket || !roomState) return
    socket.emit('game:submit_input', { roomCode: roomState.code, text })
  }

  const clearError = () => setError(null)

  const resetGame = () => {
    setResults(null)
    setCountdown(null)
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        roomState,
        countdown,
        gameAudio,
        results,
        error,
        currentPlayerNickname,
        audioPreloaded,
        joinRoom,
        startRoom,
        submitInput,
        clearError,
        resetGame,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
