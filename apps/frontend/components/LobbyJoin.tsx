'use client'

import { useSocket } from '../context/socket-context'
import { JoinView } from './views/JoinView'

export function LobbyJoin() {
  const { joinRoom, error, clearError } = useSocket()

  return <JoinView onJoin={joinRoom} error={error} onClearError={clearError} />
}
