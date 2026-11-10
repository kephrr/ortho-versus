'use client'

import { useEffect, useState } from 'react'
import { useSocket } from '../context/socket-context'
import { GameView } from './views/GameView'

export function GameActive() {
  const {
    countdown,
    roomState,
    currentPlayerNickname,
    gameAudio,
    submitInput,
    isAudioPlaying,
    audioBlocked,
    audioCurrentTime,
    audioDuration,
    playbackRate,
    setPlaybackRate,
    playAudio,
    toggleAudio,
    replayAudio,
  } = useSocket()

  const [inputText, setInputText] = useState('')
  const [secondsRemaining, setSecondsRemaining] = useState(
    roomState?.writingDurationSeconds || 45
  )

  const writingDuration =
    gameAudio?.writingDuration || roomState?.writingDurationSeconds || 45

  // Auto-save on every keystroke
  const handleInputChange = (value: string) => {
    setInputText(value)
    submitInput(value)
  }

  // Countdown based on an absolute end date to avoid drift
  useEffect(() => {
    if (roomState?.status !== 'PLAYING') return

    const endsAt = Date.now() + writingDuration * 1000
    const interval = setInterval(() => {
      setSecondsRemaining(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)))
    }, 250)

    return () => clearInterval(interval)
  }, [roomState?.status, writingDuration])

  if (!roomState) return null

  return (
    <GameView
      status={roomState.status}
      countdown={countdown}
      roomCode={roomState.code}
      players={roomState.players}
      currentPlayerNickname={currentPlayerNickname}
      secondsRemaining={secondsRemaining}
      writingDuration={writingDuration}
      inputText={inputText}
      onInputChange={handleInputChange}
      audio={{
        playing: isAudioPlaying,
        blocked: audioBlocked,
        currentTime: audioCurrentTime,
        duration: audioDuration || gameAudio?.duration || roomState.audioDurationSeconds,
      }}
      playbackRate={playbackRate}
      onToggleAudio={toggleAudio}
      onReplayAudio={replayAudio}
      onPlayAudio={playAudio}
      onPlaybackRateChange={setPlaybackRate}
    />
  )
}
