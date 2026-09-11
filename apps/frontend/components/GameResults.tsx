'use client'

import React from 'react'
import { useSocket } from '../context/socket-context'
import { Trophy, Award, RotateCcw, Quote, CheckCircle2 } from 'lucide-react'

export function GameResults() {
  const { results, startRoom, roomState, currentPlayerNickname } = useSocket()

  if (!results) return null

  const isHost = roomState?.players.find((p) => p.nickname === currentPlayerNickname)?.isHost

  return (
    <div className="card-playful w-full max-w-3xl mx-auto flex flex-col overflow-hidden max-h-[85vh]">
      {/* Header */}
      <div className="text-center p-6 sm:p-8 bg-blue-50 border-b-2 border-slate-100 flex-shrink-0">
        <div className="inline-flex p-4 bg-yellow-100 text-yellow-500 rounded-full border-4 border-yellow-200 mb-2 shadow-sm">
          <Trophy className="w-10 h-10" />
        </div>
        <h2 className="text-4xl sm:text-5xl font-display font-black text-slate-800">Résultats</h2>
        <p className="text-slate-500 font-sans mt-2 font-medium">Découvrez notre champion de l'orthographe !</p>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white space-y-8 custom-scrollbar">
        
        {/* Target Transcript Reveal (Anti-cheat was keeping it secret until now!) */}
        <div className="p-5 rounded-2xl bg-orange-50 border-2 border-orange-100 relative">
          <div className="absolute -top-3 -left-3 p-2 bg-orange-400 text-white rounded-xl shadow-sm rotate-[-10deg]">
            <Quote className="w-4 h-4" />
          </div>
          <span className="text-xs font-display font-bold uppercase tracking-wider text-orange-600 ml-4 block mb-2">
            Texte Dicté Officiel
          </span>
          <p className="text-slate-800 text-lg font-sans font-medium leading-relaxed px-4">
            « {results.targetTranscript} »
          </p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          <h3 className="text-sm font-display font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-slate-300" />
            Classement ({results.results.length} participants)
          </h3>

          <div className="space-y-3">
            {results.results.map((res, index) => {
              const isFirst = index === 0
              const isMe = res.nickname === currentPlayerNickname

              return (
                <div
                  key={res.playerId}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                    isFirst
                      ? 'bg-yellow-50 border-yellow-300 shadow-[0_4px_0_0_rgba(253,224,71,1)] transform -translate-y-1'
                      : isMe
                      ? 'bg-blue-50 border-blue-200 shadow-[0_4px_0_0_rgba(191,219,254,1)]'
                      : 'bg-white border-slate-100 shadow-[0_2px_0_0_rgba(241,245,249,1)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Position & Player */}
                    <div className="flex items-center gap-3">
                      <div className={`font-display font-black text-2xl w-10 text-center ${isFirst ? 'text-yellow-500' : 'text-slate-300'}`}>
                        #{index + 1}
                      </div>
                      <div className="bg-white text-3xl w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm border border-slate-100">
                        {res.avatar}
                      </div>
                      <div>
                        <div className="font-display font-bold text-xl text-slate-800 flex items-center gap-2">
                          <span className="truncate">{res.nickname}</span>
                          {isFirst && <Award className="w-5 h-5 text-yellow-500 animate-bounce" />}
                        </div>
                        <div className="text-sm font-sans font-medium mt-1">
                          {isMe ? (
                            <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs font-bold mr-2 uppercase">Tu es ici</span>
                          ) : null}
                          <span className={res.wordErrorCount === 0 ? 'text-green-500' : 'text-rose-500'}>
                            {res.wordErrorCount} {res.wordErrorCount > 1 ? 'fautes' : 'faute'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t-2 sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      <span className="text-xs uppercase font-display font-bold text-slate-400 sm:hidden">Précision</span>
                      <div className={`text-4xl font-display font-black ${
                        res.accuracyScore === 100 ? 'text-green-500' : 
                        res.accuracyScore >= 80 ? 'text-blue-500' : 
                        res.accuracyScore >= 50 ? 'text-orange-500' : 'text-rose-500'
                      }`}>
                        {res.accuracyScore}%
                      </div>
                      <span className="hidden sm:block text-xs uppercase font-sans font-bold text-slate-300 mt-1">
                        Précision
                      </span>
                    </div>

                  </div>

                  {/* Player's submitted text */}
                  <div className={`mt-4 pt-4 border-t-2 text-sm font-sans leading-relaxed ${isFirst ? 'border-yellow-200/50' : 'border-slate-100'}`}>
                    <span className="font-display font-bold text-slate-400 mr-2 uppercase text-xs">Copie rendue :</span>
                    <span className={res.submittedText ? 'text-slate-600 font-medium' : 'text-slate-400 italic'}>
                      {res.submittedText ? `« ${res.submittedText} »` : 'Aucune réponse soumise (Copie blanche)'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Host Controls */}
      <div className="p-6 sm:p-8 bg-slate-50 border-t-2 border-slate-100 flex-shrink-0">
        {isHost ? (
          <button
            onClick={startRoom}
            className="w-full text-lg py-5 px-6 btn-secondary flex items-center justify-center gap-3 text-slate-800"
          >
            <RotateCcw className="w-6 h-6" />
            <span className="pt-0.5">Lancer une nouvelle manche</span>
          </button>
        ) : (
          <div className="text-center py-5 px-6 font-display font-bold text-slate-400 border-2 border-slate-200 rounded-2xl border-dashed">
            En attente de l'hôte pour la prochaine manche...
          </div>
        )}
      </div>
    </div>
  )
}
