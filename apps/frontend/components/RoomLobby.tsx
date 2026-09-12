'use client'

import React, { useState } from 'react'
import { useSocket } from '../context/socket-context'
import { Crown, Users, Play, Copy, Check, Volume2, UserCheck } from 'lucide-react'

export function RoomLobby() {
  const { roomState, startRoom, currentPlayerNickname } = useSocket()
  const [copied, setCopied] = useState(false)

  if (!roomState) return null

  const currentPlayer = roomState.players.find((p) => p.nickname === currentPlayerNickname)
  const isHost = currentPlayer?.isHost

  const handleCopy = () => {
    navigator.clipboard.writeText(roomState.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card-playful w-full max-w-xl p-6 md:p-8 mx-auto">
      {/* Room Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-6 border-b-2 border-slate-100">
        <div className="text-center sm:text-left">
          <span className="text-sm font-sans font-bold uppercase tracking-wider text-slate-400">Code du salon</span>
          <div className="flex items-center gap-3 mt-1 justify-center sm:justify-start">
            <h2 className="text-4xl font-display font-black tracking-widest text-[var(--color-brand-primary)]">
              {roomState.code}
            </h2>
            <button
              onClick={handleCopy}
              className={`p-2.5 flex items-center justify-center rounded-xl transition-all duration-150 border-b-2 active:border-b-0 active:mt-0.5 ${
                copied
                  ? 'bg-green-100 text-green-600 border-green-300'
                  : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
              }`}
              title="Copier le code"
            >
              {copied ? <Check className="w-5 h-5 font-bold" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-100 border-2 border-orange-200 text-orange-600 font-display font-bold">
          <Users className="w-5 h-5" />
          <span>{roomState.players.length} / {roomState.maxPlayers}</span>
        </div>
      </div>

      {/* Info Notice */}
      <div className="mt-6 p-4 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-start gap-4">
        <div className="bg-white p-2 rounded-xl text-blue-500 shadow-sm border border-blue-50">
          <Volume2 className="w-6 h-6" />
        </div>
        <p className="text-slate-600 font-sans text-sm font-medium pt-1">
          L'audio est préchargé et démarrera automatiquement à la fin du décompte. Mettez le son !
        </p>
      </div>

      {/* Players List */}
      <div className="mt-8">
        <h3 className="text-sm font-display font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Joueurs prêts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roomState.players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center p-3 rounded-2xl border-2 transition-all ${
                player.nickname === currentPlayerNickname
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : 'bg-white border-slate-100 shadow-[0_2px_0_0_rgba(241,245,249,1)]'
              }`}
            >
              <div className="bg-slate-100 text-3xl w-14 h-14 flex items-center justify-center rounded-xl mr-3 border border-slate-200 shadow-sm">
                {player.avatar}
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-slate-800 text-lg flex items-center gap-2">
                  <span className="truncate">{player.nickname}</span>
                </div>
                {player.isHost ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 mt-1 uppercase">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Hôte du salon</span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-slate-400 mt-1 uppercase">
                    Participant
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-8">
        {isHost ? (
          <button
            onClick={startRoom}
            className="w-full py-5 text-xl btn-primary"
            disabled={roomState.players.length < 1} // Even if 1 for solo testing
          >
            <Play className="w-6 h-6 mr-2 fill-current" />
            Lancer la partie
          </button>
        ) : (
          <div className="text-center py-5 px-6 font-display font-bold text-slate-400 bg-slate-50 border-2 border-slate-100 rounded-2xl border-dashed">
            L'hôte prépare le lancement...
          </div>
        )}
      </div>
    </div>
  )
}
