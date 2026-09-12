'use client'

import React, { useState, useEffect } from 'react'
import { useSocket } from '../context/socket-context'
import { Volume2, VolumeX, Clock, CheckCircle2, Type, Play, Pause, RotateCcw } from 'lucide-react'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function GameActive() {
  const {
    countdown,
    roomState,
    gameAudio,
    submitInput,
    isAudioPlaying,
    audioBlocked,
    audioCurrentTime,
    audioDuration,
    playAudio,
    toggleAudio,
    replayAudio,
  } = useSocket()
  const [inputText, setInputText] = useState('')
  const [secondsRemaining, setSecondsRemaining] = useState<number>(roomState?.audioDurationSeconds || 54)

  // Real-time keystroke submission
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInputText(val)
    submitInput(val)
  }

  // Timer countdown while playing
  useEffect(() => {
    if (roomState?.status === 'PLAYING') {
      const duration = gameAudio?.duration || roomState.audioDurationSeconds || 54
      setSecondsRemaining(duration)

      const interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [roomState?.status, gameAudio?.duration, roomState?.audioDurationSeconds])

  // If in countdown state (5, 4, 3, 2, 1)
  if (roomState?.status === 'STARTING') {
    return (
      <div className="card-playful p-12 w-full max-w-md mx-auto text-center">
        <span className="text-sm font-display font-bold uppercase tracking-wider text-[var(--color-brand-primary)]">
          Préparez-vous...
        </span>
        <div className="my-6 text-8xl font-display font-black text-slate-800 tabular-nums">
          {countdown ?? 5}
        </div>
        <p className="text-slate-500 font-sans text-lg flex items-center justify-center gap-3">
          <Volume2 className="w-5 h-5 text-green-500 animate-pulse" />
          Mettez le son, la dictée démarre !
        </p>
      </div>
    )
  }

  // If evaluating state
  if (roomState?.status === 'EVALUATING') {
    return (
      <div className="card-playful p-12 w-full max-w-md mx-auto text-center space-y-6">
        <div className="inline-flex rounded-full p-4 bg-orange-100 text-orange-500">
          <CheckCircle2 className="w-12 h-12 animate-pulse" />
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-800">Correction...</h2>
          <p className="text-slate-500 mt-2 font-sans font-medium">Analyse méticuleuse de vos copies !</p>
        </div>
      </div>
    )
  }

  // Active playing phase
  const isTimeLow = secondsRemaining <= 5
  const totalAudioDuration = audioDuration || gameAudio?.duration || roomState?.audioDurationSeconds || 54
  const audioProgressPercent = totalAudioDuration > 0 ? Math.min(100, (audioCurrentTime / totalAudioDuration) * 100) : 0

  return (
    <div className="card-playful w-full max-w-2xl mx-auto flex flex-col h-full overflow-hidden">
      {/* Autoplay Blocked Alert */}
      {audioBlocked && (
        <div className="bg-amber-50 border-b-2 border-amber-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-sans font-medium">
            <VolumeX className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Votre navigateur a bloqué la lecture automatique.</span>
          </div>
          <button
            onClick={playAudio}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-display font-bold rounded-xl text-sm shadow-sm transition-all flex items-center gap-2 animate-bounce cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Lancer l'audio
          </button>
        </div>
      )}

      {/* Active Header & Timer */}
      <div className="flex justify-between items-center bg-slate-50 border-b-2 border-slate-100 p-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shadow-sm border transition-colors ${
            isAudioPlaying
              ? 'bg-green-100 text-green-600 border-green-200'
              : 'bg-blue-100 text-blue-500 border-blue-200'
          }`}>
            <Volume2 className={`w-6 h-6 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <span className="text-sm font-display font-bold text-slate-800 block">Dictée audio</span>
            <span className="text-xs text-slate-500 font-sans">
              {isAudioPlaying ? 'Lecture en cours...' : 'Audio en pause'}
            </span>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl border-4 font-display font-bold text-xl transition-colors ${
          isTimeLow 
          ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
          : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}>
          <Clock className={`w-5 h-5 ${isTimeLow ? 'text-red-500' : 'text-slate-400'}`} />
          <span className="tabular-nums min-w-[3ch] text-center">{secondsRemaining}s</span>
        </div>
      </div>

      {/* Audio Player Controls Bar */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 md:px-8 py-3 flex items-center gap-4">
        <button
          onClick={toggleAudio}
          className={`p-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center ${
            isAudioPlaying
              ? 'bg-[var(--color-brand-primary)] text-white hover:opacity-90'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
          title={isAudioPlaying ? 'Mettre en pause' : 'Lancer la lecture'}
        >
          {isAudioPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <button
          onClick={replayAudio}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          title="Réécouter depuis le début"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Audio Progress Track */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-[var(--color-brand-primary)] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${audioProgressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1 font-sans font-medium tabular-nums">
            <span>{formatTime(audioCurrentTime)}</span>
            <span>{formatTime(totalAudioDuration)}</span>
          </div>
        </div>
      </div>

      {/* Typing Zone */}
      <div className="p-6 md:p-8 flex-1 flex flex-col bg-white">
        <label htmlFor="dictation-input" className="flex justify-between items-end mb-3">
          <span className="text-sm font-display font-bold text-slate-500 flex items-center gap-2">
            <Type className="w-4 h-4" /> Tapez le texte dicté :
          </span>
          <span className="text-sm font-display font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {inputText.trim().split(/\s+/).filter(Boolean).length} mots
          </span>
        </label>

        <textarea
          id="dictation-input"
          autoFocus
          value={inputText}
          onChange={handleChange}
          rows={6}
          placeholder="Écoutez la voix et commencez à taper ici..."
          spellCheck={false}
          className="w-full flex-1 p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl text-xl font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--color-brand-primary)] focus:bg-white transition-all shadow-inner leading-relaxed resize-none selection:bg-blue-100 selection:text-blue-900"
        />

        <div className="mt-4 flex items-center justify-center text-xs font-sans font-medium text-slate-400">
          <span className="bg-slate-100 px-3 py-1 rounded-md">Sauvegarde automatique des frappes</span>
        </div>
      </div>
    </div>
  )
}
