'use client'

import React, { useState, useEffect } from 'react'
import { useSocket } from '../context/socket-context'
import { Volume2, Clock, CheckCircle2, Type } from 'lucide-react'

export function GameActive() {
  const { countdown, roomState, gameAudio, submitInput } = useSocket()
  const [inputText, setInputText] = useState('')
  const [secondsRemaining, setSecondsRemaining] = useState<number>(roomState?.audioDurationSeconds || 15)

  // Real-time keystroke submission
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInputText(val)
    submitInput(val)
  }

  // Timer countdown while playing
  useEffect(() => {
    if (roomState?.status === 'PLAYING') {
      const duration = gameAudio?.duration || roomState.audioDurationSeconds || 15
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
          Mettez le son, la dictée arrive !
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

  return (
    <div className="card-playful w-full max-w-2xl mx-auto flex flex-col h-full">
      {/* Active Header & Timer */}
      <div className="flex justify-between items-center bg-slate-50 border-b-2 border-slate-100 p-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-100 text-blue-500 shadow-sm border border-blue-200">
            <Volume2 className="w-6 h-6 animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-display font-bold text-blue-700 block">Dictée en cours</span>
            <span className="text-xs text-blue-500 font-sans">Écoutez bien !</span>
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

      {/* Typing Zone */}
      <div className="p-6 md:p-8 flex-1 flex flex-col bg-white">
        <label htmlFor="dictation-input" className="flex justify-between items-end mb-3">
          <span className="text-sm font-display font-bold text-slate-500 flex items-center gap-2">
            <Type className="w-4 h-4" /> Tapez le texte :
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
          placeholder="Commencez à taper ici..."
          spellCheck={false}
          className="w-full flex-1 p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl text-xl font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[var(--color-brand-primary)] focus:bg-white transition-all shadow-inner leading-relaxed resize-none selection:bg-blue-100 selection:text-blue-900"
        />

        <div className="mt-4 flex items-center justify-center text-xs font-sans font-medium text-slate-400">
          <span className="bg-slate-100 px-3 py-1 rounded-md">Sauvegarde automatique</span>
        </div>
      </div>
    </div>
  )
}
