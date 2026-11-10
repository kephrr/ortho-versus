'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppShell } from '@/components/ui/AppShell'
import { JoinView } from '@/components/views/JoinView'
import { LobbyView } from '@/components/views/LobbyView'
import { GameView, type PlaybackRate } from '@/components/views/GameView'
import { ResultsView } from '@/components/views/ResultsView'
import {
  MOCK_CURRENT_PLAYER,
  MOCK_INPUT,
  MOCK_RESULTS,
  MOCK_ROOM,
} from './mock'
import { PREVIEW_SCREENS, type PreviewScreen } from './screens'

export function PreviewClient({
  initialScreen,
  bare,
}: {
  initialScreen: PreviewScreen
  bare: boolean
}) {
  const [screen, setScreen] = useState<PreviewScreen>(initialScreen)
  const [inputText, setInputText] = useState(MOCK_INPUT)
  const [playing, setPlaying] = useState(true)
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1)

  let content: React.ReactNode

  if (screen === 'join') {
    content = (
      <JoinView
        onJoin={() => undefined}
        error={null}
        onClearError={() => undefined}
        defaultNickname="Victor Hugo"
      />
    )
  } else if (screen === 'lobby') {
    content = (
      <LobbyView
        roomState={MOCK_ROOM}
        currentPlayerNickname={MOCK_CURRENT_PLAYER}
        onStart={() => undefined}
      />
    )
  } else if (screen === 'results') {
    content = (
      <ResultsView
        results={MOCK_RESULTS}
        roomState={MOCK_ROOM}
        currentPlayerNickname={MOCK_CURRENT_PLAYER}
        onRestart={() => undefined}
      />
    )
  } else {
    const status =
      screen === 'countdown' ? 'STARTING' : screen === 'evaluating' ? 'EVALUATING' : 'PLAYING'

    content = (
      <GameView
        status={status}
        countdown={3}
        roomCode={MOCK_ROOM.code}
        players={MOCK_ROOM.players}
        currentPlayerNickname={MOCK_CURRENT_PLAYER}
        secondsRemaining={screen === 'countdown' ? 45 : 31}
        writingDuration={45}
        inputText={inputText}
        onInputChange={setInputText}
        audio={{
          playing: screen === 'game' ? playing : false,
          blocked: false,
          currentTime: screen === 'game' ? 7.4 : 0,
          duration: MOCK_ROOM.audioDurationSeconds,
        }}
        playbackRate={playbackRate}
        onToggleAudio={() => setPlaying((value) => !value)}
        onReplayAudio={() => setPlaying(true)}
        onPlayAudio={() => setPlaying(true)}
        onPlaybackRateChange={setPlaybackRate}
      />
    )
  }

  return (
    <>
      <AppShell
        roomCode={screen === 'join' ? undefined : MOCK_ROOM.code}
        centered={screen === 'join' || screen === 'countdown' || screen === 'evaluating'}
      >
        {content}
      </AppShell>

      {!bare && (
        <div className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-2xl border-2 border-cream/15 bg-ink px-3 py-2 text-cream shadow-[0_8px_0_0_rgba(28,25,19,0.25)] sm:inset-x-auto sm:bottom-4 sm:left-1/2 sm:w-auto sm:max-w-none sm:-translate-x-1/2 sm:flex-nowrap sm:rounded-full sm:px-4">
          <div className="flex items-center gap-1.5 pl-1">
            <Eye className="h-3.5 w-3.5 text-coral" />
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-cream/45">
              Aperçu
            </span>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
            {PREVIEW_SCREENS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScreen(item.id)}
                aria-pressed={screen === item.id}
                className={cn(
                  'whitespace-nowrap rounded-full px-2.5 py-1.5 font-display text-[11px] font-bold transition-colors',
                  screen === item.id
                    ? 'bg-cream text-ink'
                    : 'text-cream/60 hover:bg-cream/10 hover:text-cream'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Link
            href="/"
            aria-label="Quitter l’aperçu"
            title="Quitter l’aperçu"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-cream/45 transition-colors hover:bg-cream/10 hover:text-cream"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
      )}
    </>
  )
}
