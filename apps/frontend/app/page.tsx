'use client'

import React from 'react'
import { SocketProvider, useSocket } from '../context/socket-context'
import { LobbyJoin } from '../components/LobbyJoin'
import { RoomLobby } from '../components/RoomLobby'
import { GameActive } from '../components/GameActive'
import { GameResults } from '../components/GameResults'

function TournamentArena() {
  const { roomState } = useSocket()

  if (!roomState) {
    return <LobbyJoin />
  }

  if (roomState.status === 'LOBBY') {
    return <RoomLobby />
  }

  if (roomState.status === 'STARTING' || roomState.status === 'PLAYING' || roomState.status === 'EVALUATING') {
    return <GameActive />
  }

  if (roomState.status === 'FINISHED') {
    return <GameResults />
  }

  return <LobbyJoin />
}

export default function Home() {
  return (
    <SocketProvider>
      <main className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          
          <header className="mb-12 text-center w-full">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-slate-800 tracking-tight">
              Blabla<span className="text-[var(--color-brand-primary)]">Type</span>
            </h1>
            <p className="mt-4 text-xl text-slate-500 font-sans font-medium">
              Tapez avec précision, battez vos amis !
            </p>
          </header>

          <div className="w-full relative">
            <TournamentArena />
          </div>
          
        </div>
      </main>
    </SocketProvider>
  )
}
