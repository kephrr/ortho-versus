'use client'

import { Trophy } from 'lucide-react'
import { useSocket } from '../context/socket-context'
import { PaperCard } from './ui/PaperCard'
import { ResultsView } from './views/ResultsView'

export function GameResults() {
  const { results, startRoom, roomState, currentPlayerNickname } = useSocket()

  if (!results) {
    return (
      <div className="animate-pop mx-auto w-full max-w-md">
        <PaperCard className="p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border-2 border-ink/10 bg-butter/30 text-ink/60">
            <Trophy className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-extrabold tracking-[-0.03em]">
            Dépouillement…
          </h2>
          <p className="mt-2 text-sm font-medium text-ink-soft">
            Le classement arrive dans un instant.
          </p>
        </PaperCard>
      </div>
    )
  }

  return (
    <ResultsView
      results={results}
      roomState={roomState}
      currentPlayerNickname={currentPlayerNickname}
      onRestart={startRoom}
    />
  )
}
