'use client'

import React from 'react'
import { SocketProvider, useSocket } from '../context/socket-context'
import { LobbyJoin } from '../components/LobbyJoin'
import { RoomLobby } from '../components/RoomLobby'
import { GameActive } from '../components/GameActive'
import { GameResults } from '../components/GameResults'
import { AppShell } from '../components/ui/AppShell'

function TournamentArena() {
  const { roomState } = useSocket()

  let screen: React.ReactNode

  if (!roomState) {
    screen = <LobbyJoin />
  } else if (roomState.status === 'LOBBY') {
    screen = <RoomLobby />
  } else if (
    roomState.status === 'STARTING' ||
    roomState.status === 'PLAYING' ||
    roomState.status === 'EVALUATING'
  ) {
    screen = <GameActive />
  } else if (roomState.status === 'FINISHED') {
    screen = <GameResults />
  } else {
    screen = <LobbyJoin />
  }

  return (
    <AppShell
      roomCode={roomState?.code}
      centered={
        !roomState ||
        roomState.status === 'STARTING' ||
        roomState.status === 'EVALUATING'
      }
    >
      {screen}
    </AppShell>
  )
}

export default function Home() {
  return (
    <SocketProvider>
      <TournamentArena />
    </SocketProvider>
  )
}
