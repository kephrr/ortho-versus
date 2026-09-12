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
  isAudioPlaying: boolean
  audioBlocked: boolean
  audioCurrentTime: number
  audioDuration: number
  playAudio: () => void
  pauseAudio: () => void
  toggleAudio: () => void
  replayAudio: () => void
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
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [audioBlocked, setAudioBlocked] = useState(false)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio element on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio()
      audio.preload = 'auto'

      audio.onplay = () => {
        setIsAudioPlaying(true)
        setAudioBlocked(false)
      }
      audio.onpause = () => setIsAudioPlaying(false)
      audio.onended = () => setIsAudioPlaying(false)
      audio.ontimeupdate = () => setAudioCurrentTime(audio.currentTime)
      audio.onloadedmetadata = () => setAudioDuration(audio.duration || 0)
      audio.onerror = (e) => {
        console.warn('[Audio] Element error:', e)
      }

      audioRef.current = audio

      return () => {
        audio.pause()
        audio.src = ''
        audioRef.current = null
      }
    }
  }, [])

  // Preload audio as soon as audioUrl is known from room state
  useEffect(() => {
    if (roomState?.audioUrl && audioRef.current) {
      if (!audioRef.current.src || !audioRef.current.src.endsWith(roomState.audioUrl)) {
        audioRef.current.src = roomState.audioUrl
        audioRef.current.load()
        setAudioPreloaded(true)
      }
    }
  }, [roomState?.audioUrl])

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
        setIsAudioPlaying(false)
        setAudioBlocked(false)
        setAudioCurrentTime(0)
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

      const audio = audioRef.current
      if (audio) {
        if (!audio.src || !audio.src.endsWith(payload.audioUrl)) {
          audio.src = payload.audioUrl
        }
        audio.currentTime = 0
        audio.play()
          .then(() => {
            setIsAudioPlaying(true)
            setAudioBlocked(false)
          })
          .catch((err) => {
            console.warn('[Audio] Autoplay blocked, user interaction required:', err)
            setIsAudioPlaying(false)
            setAudioBlocked(true)
          })
      }
    })

    s.on('game:results', (payload) => {
      setResults(payload)
      if (audioRef.current) {
        audioRef.current.pause()
        setIsAudioPlaying(false)
      }
    })

    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [])

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsAudioPlaying(true)
          setAudioBlocked(false)
        })
        .catch((err) => {
          console.warn('[Audio] Manual play error:', err)
        })
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsAudioPlaying(false)
    }
  }

  const toggleAudio = () => {
    if (isAudioPlaying) {
      pauseAudio()
    } else {
      playAudio()
    }
  }

  const replayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
        .then(() => {
          setIsAudioPlaying(true)
          setAudioBlocked(false)
        })
        .catch(console.error)
    }
  }

  const joinRoom = (roomCode: string, nickname: string, avatar: string) => {
    if (!socket) return
    setCurrentPlayerNickname(nickname)
    socket.emit('room:join', { roomCode, nickname, avatar })
  }

  const startRoom = () => {
    if (!socket || !roomState) return
    // Pre-arm audio on direct user click to satisfy browser user activation policy
    if (audioRef.current && roomState.audioUrl) {
      if (!audioRef.current.src || !audioRef.current.src.endsWith(roomState.audioUrl)) {
        audioRef.current.src = roomState.audioUrl
      }
      audioRef.current.load()
    }
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
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsAudioPlaying(false)
    setAudioBlocked(false)
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
        isAudioPlaying,
        audioBlocked,
        audioCurrentTime,
        audioDuration,
        playAudio,
        pauseAudio,
        toggleAudio,
        replayAudio,
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
