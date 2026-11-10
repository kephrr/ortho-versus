'use client'

import { useSocket } from '../context/socket-context'
import { LobbyView } from './views/LobbyView'

export function RoomLobby() {
  const { roomState, startRoom, currentPlayerNickname } = useSocket()

  if (!roomState) return null

  return (
    <LobbyView
      roomState={roomState}
      currentPlayerNickname={currentPlayerNickname}
      onStart={startRoom}
    />
  )
}
