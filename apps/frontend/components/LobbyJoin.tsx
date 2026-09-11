'use client'

import React, { useState } from 'react'
import { useSocket } from '../context/socket-context'
import { Crown, Sparkles, User, Users } from 'lucide-react'

const AVATARS = ['🦊', '🦉', '🐱', '🐼', '🦁', '🐸', '🦄', '🐨']

export function LobbyJoin() {
  const { joinRoom, error, clearError } = useSocket()
  const [nickname, setNickname] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return
    const code = roomCode.trim() ? roomCode.trim() : Math.random().toString(36).substring(2, 6).toUpperCase()
    joinRoom(code, nickname.trim(), selectedAvatar)
  }

  return (
    <div className="card-playful w-full p-8 md:p-10 mx-auto transition-all">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-4 border-4 border-orange-200">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-800 tracking-tight">Prêt à jouer ?</h2>
        <p className="text-slate-500 font-sans mt-2">Choisis ton personnage et entre dans l'arène !</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-100 border-2 border-red-200 text-red-600 font-bold text-sm flex justify-between items-center shadow-sm">
          <span>{error}</span>
          <button onClick={clearError} className="p-1 hover:bg-red-200 rounded-lg transition-colors">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-display font-bold text-slate-700 mb-3">
            Choisis ton Avatar
          </label>
          <div className="grid grid-cols-4 gap-3">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => setSelectedAvatar(avatar)}
                className={`text-3xl p-3 rounded-2xl transition-all duration-150 flex items-center justify-center ${
                  selectedAvatar === avatar
                    ? 'bg-blue-100 border-b-4 border-blue-300 ring-2 ring-blue-400 transform -translate-y-1'
                    : 'bg-slate-100 border-b-4 border-slate-200 hover:bg-slate-200 hover:-translate-y-1'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-display font-bold text-slate-700 mb-3">
            Ton Pseudo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: Victor Hugo"
              maxLength={20}
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 font-sans font-bold placeholder-slate-400 focus:outline-none focus:border-[var(--color-brand-primary)] focus:bg-white transition-all shadow-inner"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-display font-bold text-slate-700 mb-3 flex items-center justify-between">
            <span>Code de salon</span>
            <span className="text-xs font-sans font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Optionnel</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Users className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Ex: AB12"
              maxLength={6}
              className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-800 uppercase font-sans font-bold tracking-widest placeholder-slate-400 focus:outline-none focus:border-[var(--color-brand-secondary)] focus:bg-white transition-all shadow-inner"
            />
          </div>
          <p className="text-sm font-sans text-slate-400 mt-2 ml-1">Laisse vide pour créer un nouveau salon.</p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className={`w-full text-lg py-4 px-6 flex items-center justify-center gap-2 ${
              roomCode.trim() ? 'btn-secondary text-slate-800' : 'btn-primary'
            }`}
          >
            {roomCode.trim() ? (
              <>
                <Users className="w-6 h-6" />
                Rejoindre le salon
              </>
            ) : (
              <>
                <Crown className="w-6 h-6" />
                Créer un salon
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
