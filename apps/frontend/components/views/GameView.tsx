'use client'

import type { Player, RoomStatus } from '@app/shared'
import {
  AudioLines,
  Check,
  Headphones,
  Info,
  Pause,
  PenLine,
  Play,
  RotateCcw,
  VolumeX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { countWords, formatTime } from '@/lib/format'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { PaperCard } from '@/components/ui/PaperCard'
import { SoundWave } from '@/components/ui/SoundWave'
import { TimerRing } from '@/components/ui/TimerRing'

export type PlaybackRate = 0.75 | 1 | 1.25

export interface GameAudioState {
  playing: boolean
  blocked: boolean
  currentTime: number
  duration: number
}

export interface GameViewProps {
  status: RoomStatus
  countdown: number | null
  roomCode: string
  players: Player[]
  currentPlayerNickname: string
  secondsRemaining: number
  writingDuration: number
  inputText: string
  onInputChange: (text: string) => void
  audio: GameAudioState
  playbackRate: PlaybackRate
  onToggleAudio: () => void
  onReplayAudio: () => void
  onPlayAudio: () => void
  onPlaybackRateChange: (rate: PlaybackRate) => void
}

const RATES: PlaybackRate[] = [0.75, 1, 1.25]

function PlayerStrip({
  players,
  currentPlayerNickname,
}: {
  players: Player[]
  currentPlayerNickname: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex -space-x-2">
        {players.map((player) => (
          <Avatar
            key={player.id}
            avatar={player.avatar}
            size="xs"
            className={cn(
              'ring-2 ring-cream',
              player.nickname === currentPlayerNickname && 'ring-coral'
            )}
          />
        ))}
      </div>
      <span className="text-[11px] font-semibold text-ink-soft">
        {players.length} joueur{players.length > 1 ? 's' : ''} en lice
      </span>
    </div>
  )
}

export function GameView({
  status,
  countdown,
  players,
  currentPlayerNickname,
  secondsRemaining,
  writingDuration,
  inputText,
  onInputChange,
  audio,
  playbackRate,
  onToggleAudio,
  onReplayAudio,
  onPlayAudio,
  onPlaybackRateChange,
}: GameViewProps) {
  /* ------------------------------------------------------------ */
  /* Countdown                                                    */
  /* ------------------------------------------------------------ */
  if (status === 'STARTING') {
    const displayed = countdown ?? 5

    return (
      <div className="animate-pop mx-auto w-full max-w-xl">
        <PaperCard className="overflow-hidden text-center">
          <div className="relative overflow-hidden bg-ink px-6 py-10 text-cream sm:px-10 sm:py-12">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 -top-10 select-none font-serif text-[190px] leading-none text-cream/[0.045]"
            >
              é
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 bg-cream/5 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-cream/70">
              Manche 01
            </span>
            <p className="eyebrow mt-6 text-cream/45">Prépare-toi</p>
            <div
              key={displayed}
              className="animate-countdown mt-1 font-display text-[126px] font-extrabold leading-none tabular-nums text-cream sm:text-[148px]"
            >
              {displayed}
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cream/60">
              <Headphones className="h-4 w-4 text-coral" />
              Mets le son, la dictée arrive.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-cream px-5 py-4">
            <PlayerStrip players={players} currentPlayerNickname={currentPlayerNickname} />
            <span className="text-[11px] font-semibold text-ink-soft/70">
              Départ automatique
            </span>
          </div>
        </PaperCard>
      </div>
    )
  }

  /* ------------------------------------------------------------ */
  /* Evaluating                                                   */
  /* ------------------------------------------------------------ */
  if (status === 'EVALUATING') {
    return (
      <div className="animate-pop mx-auto w-full max-w-xl">
        <PaperCard className="overflow-hidden">
          <div className="relative overflow-hidden bg-ink p-6 text-cream sm:p-8">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -right-4 select-none font-serif text-[190px] leading-none text-cream/[0.045]"
            >
              ç
            </span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
              </span>
              <span className="eyebrow text-coral">Correction</span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-[-0.03em]">
              On vérifie chaque accent…
            </h2>
            <p className="mt-2 text-sm font-medium text-cream/60">
              Les {players.length} copie{players.length > 1 ? 's' : ''} passent au crible.
            </p>

            <div className="mt-6 space-y-2.5">
              {[92, 78, 58].map((width, index) => (
                <div key={width} className="h-3 overflow-hidden rounded-full bg-cream/10">
                  <div
                    className="shimmer-line h-full rounded-full"
                    style={{ width: `${width}%`, animationDelay: `${index * 180}ms` }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 bg-cream px-5 py-4">
            <SoundWave active tone="ink" className="h-8 w-24" />
            <div>
              <p className="font-display text-sm font-bold text-ink">Analyse en cours</p>
              <p className="text-xs font-medium text-ink-soft">
                Le classement arrive dans un instant.
              </p>
            </div>
          </div>
        </PaperCard>
      </div>
    )
  }

  /* ------------------------------------------------------------ */
  /* Playing                                                      */
  /* ------------------------------------------------------------ */
  const lowTime = secondsRemaining <= 10
  const words = countWords(inputText)
  const duration = audio.duration || 20
  const progress = duration > 0 ? Math.min(100, (audio.currentTime / duration) * 100) : 0

  return (
    <div className="animate-pop mx-auto w-full max-w-4xl">
      <PaperCard className="overflow-hidden">
        {/* Autoplay warning */}
        {audio.blocked && (
          <div className="flex flex-col gap-3 border-b-2 border-ink/10 bg-butter/40 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <VolumeX className="h-4 w-4 text-coral-deep" />
              Ton navigateur a bloqué la lecture automatique.
            </div>
            <Button size="sm" variant="ink" onClick={onPlayAudio} className="shrink-0">
              <Play className="h-3.5 w-3.5 fill-current" />
              Lancer l’audio
            </Button>
          </div>
        )}

        {/* Status header + timer */}
        <div
          className={cn(
            'flex items-center justify-between gap-4 border-b-2 px-5 py-3.5 transition-colors sm:px-6',
            lowTime ? 'border-rose/25 bg-rose/5' : 'border-ink/10 bg-cream'
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-display text-[11px] font-bold text-cream">
              01
            </span>
            <div>
              <p className="eyebrow hidden text-ink-soft/60 sm:block">Manche en cours</p>
              <p className="font-display text-sm font-bold text-ink">Extrait audio</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="eyebrow whitespace-nowrap text-ink-soft/60">
                <span className="sm:hidden">Temps</span>
                <span className="hidden sm:inline">Temps restant</span>
              </p>
              <p
                className={cn(
                  'font-display text-lg font-extrabold tabular-nums leading-tight',
                  lowTime ? 'text-rose' : 'text-ink'
                )}
              >
                {formatTime(secondsRemaining)}
              </p>
            </div>
            <TimerRing
              seconds={secondsRemaining}
              total={writingDuration}
              size={54}
              lowAt={10}
            />
          </div>
        </div>

        {/* Audio deck */}
        <div className="bg-ink px-5 py-5 text-cream sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-coral/15 text-coral">
                <AudioLines className="h-4 w-4" />
              </span>
              <p className="font-display text-sm font-bold">Écoute l’extrait</p>
              <Chip
                tone="ghost"
                className="hidden border-cream/10 bg-cream/5 text-cream/50 sm:inline-flex"
              >
                {Math.round(duration)} s
              </Chip>
            </div>

            <div className="flex rounded-xl border border-cream/15 bg-cream/[0.04] p-1">
              {RATES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onPlaybackRateChange(rate)}
                  aria-pressed={playbackRate === rate}
                  className={cn(
                    'rounded-lg px-2 py-1 font-display text-[11px] font-bold transition-colors',
                    playbackRate === rate
                      ? 'bg-cream text-ink'
                      : 'text-cream/55 hover:text-cream'
                  )}
                  title={`Vitesse de lecture x${rate}`}
                >
                  x{rate}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onToggleAudio}
              aria-label={audio.playing ? 'Mettre la dictée en pause' : 'Lancer la dictée'}
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-cream/10 bg-coral text-cream shadow-[0_4px_0_0_var(--color-coral-deep)] transition-all hover:bg-[#ff6a48] active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-coral-deep)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-coral/30"
            >
              {audio.playing ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              )}
            </button>

            <SoundWave active={audio.playing} className="h-10 flex-1" />

            <div className="hidden shrink-0 text-right text-[11px] font-semibold tabular-nums text-cream/55 sm:block">
              {formatTime(audio.currentTime)}
              <span className="mx-1 text-cream/25">/</span>
              {formatTime(duration)}
            </div>

            <Button
              variant="darkGhost"
              size="icon"
              onClick={onReplayAudio}
              aria-label="Réécouter depuis le début"
              title="Réécouter depuis le début"
              className="h-10 w-10 shrink-0 border-cream/15 text-cream/65"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-cream/10">
              <div
                className="h-full rounded-full bg-coral transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-semibold tabular-nums text-cream/40 sm:hidden">
              <span>{formatTime(audio.currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Typing sheet */}
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-2.5">
            <label
              htmlFor="dictation-input"
              className="inline-flex items-center gap-2 font-display text-sm font-bold text-ink"
            >
              <PenLine className="h-4 w-4 text-coral" />
              Ta dictée
            </label>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-ink/10 bg-white/60 px-2.5 py-1 font-display text-[9px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                <Check className="h-3 w-3 text-mint" />
                Sauvegarde auto
              </span>
              <span className="rounded-full bg-ink px-2.5 py-1 font-display text-[10px] font-bold tabular-nums text-cream">
                {words} mot{words > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <textarea
            id="dictation-input"
            autoFocus
            value={inputText}
            onChange={(event) => onInputChange(event.target.value)}
            rows={6}
            placeholder="Écoute la voix et commence à taper ici…"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="dictation-sheet mt-3 min-h-[220px] w-full resize-none rounded-2xl border-2 border-ink/15 px-5 py-4 font-sans text-[17px] font-medium leading-relaxed text-ink placeholder:text-ink/35 transition-colors selection:bg-butter/70 selection:text-ink focus:border-ink focus:outline-none focus:ring-4 focus:ring-coral/15 sm:text-lg"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-ink-soft/70">
            <span className="inline-flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Ton texte est envoyé à chaque frappe.
            </span>
            <span className="tabular-nums">{inputText.length} caractères</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t-2 border-ink/10 bg-white/40 px-5 py-3 sm:px-6">
          <PlayerStrip players={players} currentPlayerNickname={currentPlayerNickname} />
          <span className="hidden text-[11px] font-semibold text-ink-soft/60 sm:inline">
            La manche se termine automatiquement
          </span>
        </div>
      </PaperCard>
    </div>
  )
}
