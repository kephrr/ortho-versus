'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Check,
  CircleAlert,
  Headphones,
  LogIn,
  Plus,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { PaperCard } from '@/components/ui/PaperCard'

export const AVATARS = [
  { emoji: '🦊', label: 'Renard' },
  { emoji: '🦉', label: 'Hibou' },
  { emoji: '🐱', label: 'Chat' },
  { emoji: '🐼', label: 'Panda' },
  { emoji: '🦁', label: 'Lion' },
  { emoji: '🐸', label: 'Grenouille' },
  { emoji: '🦄', label: 'Licorne' },
  { emoji: '🐨', label: 'Koala' },
] as const

const STEPS = [
  {
    title: 'Choisis ton avatar',
    description: 'Huit animaux, un seul champion.',
    tone: 'bg-coral text-cream',
  },
  {
    title: 'Crée ton salon',
    description: 'Partage un code à tes amis.',
    tone: 'bg-butter text-ink',
  },
  {
    title: 'Écris plus juste',
    description: 'Chaque accent compte. Chaque point aussi.',
    tone: 'bg-cobalt text-cream',
  },
]

const ROOM_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function makeRoomCode() {
  let code = ''
  for (let index = 0; index < 4; index += 1) {
    code += ROOM_ALPHABET[Math.floor(Math.random() * ROOM_ALPHABET.length)]
  }
  return code
}

export function JoinView({
  onJoin,
  error,
  onClearError,
  defaultNickname = '',
}: {
  onJoin: (roomCode: string, nickname: string, avatar: string) => void
  error: string | null
  onClearError: () => void
  defaultNickname?: string
}) {
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [nickname, setNickname] = useState(defaultNickname)
  const [roomCode, setRoomCode] = useState('')
  const [avatar, setAvatar] = useState<string>(AVATARS[0].emoji)

  const canSubmit = nickname.trim().length > 0 && (mode === 'create' || roomCode.trim().length > 0)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    onJoin(mode === 'join' ? roomCode.trim() : makeRoomCode(), nickname.trim(), avatar)
  }

  return (
    <div className="grid w-full items-center gap-8 sm:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 xl:gap-20">
      {/* ---------------------------------------------------------- */}
      {/* Hero                                                       */}
      {/* ---------------------------------------------------------- */}
      <section className="animate-rise relative mx-auto w-full max-w-xl lg:mx-0">
        <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-cream/70 px-3 py-1.5 shadow-[0_2px_0_0_rgba(28,25,19,0.06)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-coral" />
          </span>
          <span className="eyebrow text-ink-soft">La dictée en multijoueur</span>
        </div>

        <h1 className="mt-6 font-display text-[58px] font-extrabold leading-[0.9] tracking-[-0.055em] sm:text-[76px] lg:text-[84px]">
          Écoute.
          <br />
          Écris.
          <br />
          <span className="relative inline-block text-coral">
            Gagne.
            <svg
              aria-hidden="true"
              viewBox="0 0 220 14"
              fill="none"
              className="absolute -bottom-2 left-0 h-3 w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M3 10C55 4 150 2 217 7"
                stroke="var(--color-butter)"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        <p className="mt-5 max-w-md text-balance text-[17px] font-medium leading-relaxed text-ink-soft sm:mt-7">
          Un extrait audio, 45 secondes pour l’écrire, un classement sans pitié. Choisis ton avatar
          et défie tes amis.
        </p>

        <ul className="mt-8 hidden space-y-4 lg:block">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex items-start gap-3.5">
              <span
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-xs font-extrabold shadow-[0_2px_0_0_var(--color-ink)]',
                  step.tone
                )}
              >
                {index + 1}
              </span>
              <div className="pt-0.5">
                <p className="font-display text-[15px] font-bold leading-tight text-ink">
                  {step.title}
                </p>
                <p className="mt-0.5 text-sm leading-snug text-ink-soft">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 hidden flex-wrap items-center gap-2 lg:flex">
          <Chip tone="ghost">Sans compte</Chip>
          <Chip tone="ghost">2 à 8 joueurs</Chip>
          <Chip tone="ghost">
            <Headphones className="h-3 w-3" />
            <span className="ml-1">1 min par manche</span>
          </Chip>
        </div>

        <div
          aria-hidden="true"
          className="absolute -right-8 -top-2 hidden rotate-[-8deg] lg:block"
        >
          <span className="float-slow grid h-16 w-16 place-items-center rounded-2xl border-2 border-ink bg-butter font-display text-xl font-extrabold shadow-[0_4px_0_0_var(--color-ink)]">
            A+
          </span>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Join card                                                  */}
      {/* ---------------------------------------------------------- */}
      <PaperCard className="animate-rise relative mx-auto w-full max-w-[540px] p-6 sm:p-8 lg:mx-0 lg:justify-self-end">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow text-coral-deep">Ton profil</span>
          <span className="font-display text-[11px] font-bold tracking-[0.16em] text-ink/25">
            01
          </span>
        </div>

        <h2 className="mt-2 font-display text-[30px] font-extrabold leading-tight tracking-[-0.04em] sm:text-[34px]">
          Entre dans l’arène
        </h2>
        <p className="mt-1.5 text-sm font-medium text-ink-soft">
          Un avatar, un pseudo, et c’est parti.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-coral/35 bg-coral/10 p-3.5"
          >
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-coral-deep" />
            <p className="flex-1 text-sm font-semibold leading-snug text-coral-deep">{error}</p>
            <button
              type="button"
              onClick={onClearError}
              aria-label="Fermer le message"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-coral-deep/70 transition-colors hover:bg-coral/15 hover:text-coral-deep"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <fieldset>
            <legend className="font-display text-[13px] font-bold text-ink">Ton avatar</legend>
            <div className="mt-3 grid grid-cols-4 gap-2.5" role="radiogroup" aria-label="Avatar">
              {AVATARS.map((item) => {
                const selected = item.emoji === avatar
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={item.label}
                    onClick={() => setAvatar(item.emoji)}
                    className={cn(
                      'relative grid aspect-square place-items-center rounded-2xl border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-coral/25',
                      selected
                        ? '-translate-y-0.5 border-ink bg-white shadow-[0_4px_0_0_var(--color-ink)]'
                        : 'border-ink/10 bg-white/55 hover:-translate-y-0.5 hover:border-ink/30 hover:bg-white'
                    )}
                  >
                    <Avatar
                      avatar={item.emoji}
                      size="sm"
                      className="h-12 w-12 border-0 text-[30px] shadow-none"
                    />
                    {selected && (
                      <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full border-2 border-ink bg-coral text-cream">
                        <Check className="h-3 w-3" strokeWidth={3.5} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="nickname"
                className="font-display text-[13px] font-bold text-ink"
              >
                Ton pseudo
              </label>
              <span className="font-display text-[11px] font-bold tabular-nums text-ink/30">
                {nickname.length}/20
              </span>
            </div>
            <div className="relative mt-2">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/30" />
              <input
                id="nickname"
                required
                maxLength={20}
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="Ex : Victor Hugo"
                className="h-14 w-full rounded-2xl border-2 border-ink/15 bg-white/65 pl-12 pr-4 font-display text-lg font-semibold text-ink placeholder:font-medium placeholder:text-ink/35 transition-colors focus:border-ink focus:bg-white focus:outline-none focus:ring-4 focus:ring-coral/15"
              />
            </div>
          </div>

          <div>
            <span className="font-display text-[13px] font-bold text-ink">Tu veux…</span>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-2xl border-2 border-ink/10 bg-ink/[0.045] p-1">
              <button
                type="button"
                aria-pressed={mode === 'create'}
                onClick={() => setMode('create')}
                className={cn(
                  'inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 font-display text-sm font-bold transition-all',
                  mode === 'create'
                    ? 'border-ink bg-cream text-ink shadow-[0_2px_0_0_var(--color-ink)]'
                    : 'border-transparent text-ink-soft hover:text-ink'
                )}
              >
                <Plus className="h-4 w-4" />
                Créer
              </button>
              <button
                type="button"
                aria-pressed={mode === 'join'}
                onClick={() => setMode('join')}
                className={cn(
                  'inline-flex h-10 items-center justify-center gap-2 rounded-xl border-2 font-display text-sm font-bold transition-all',
                  mode === 'join'
                    ? 'border-ink bg-cream text-ink shadow-[0_2px_0_0_var(--color-ink)]'
                    : 'border-transparent text-ink-soft hover:text-ink'
                )}
              >
                <LogIn className="h-4 w-4" />
                Rejoindre
              </button>
            </div>
          </div>

          {mode === 'join' && (
            <div className="animate-pop">
              <label
                htmlFor="room-code"
                className="font-display text-[13px] font-bold text-ink"
              >
                Code du salon
              </label>
              <input
                id="room-code"
                autoFocus
                value={roomCode}
                onChange={(event) =>
                  setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                }
                placeholder="ABCD"
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                className="mt-2 h-14 w-full rounded-2xl border-2 border-ink/15 bg-white/65 px-4 text-center font-display text-2xl font-extrabold uppercase tracking-[0.35em] text-ink placeholder:tracking-[0.2em] placeholder:text-ink/30 transition-colors focus:border-ink focus:bg-white focus:outline-none focus:ring-4 focus:ring-cobalt/15"
              />
              <p className="mt-2 text-xs font-medium text-ink-soft">
                Le code se trouve dans la salle d’attente de l’hôte.
              </p>
            </div>
          )}

          <div className="pt-0.5">
            <Button
              type="submit"
              size="xl"
              fullWidth
              disabled={!canSubmit}
              className="group"
            >
              {mode === 'create' ? (
                <Sparkles className="h-5 w-5" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              {mode === 'create' ? 'Créer mon salon' : 'Rejoindre la partie'}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Button>
            <p className="mt-3 text-center text-xs font-medium text-ink-soft">
              {mode === 'create'
                ? 'Aucun compte requis · un code sera généré pour inviter tes amis'
                : 'Aucun compte requis · entre le code et c’est parti'}
            </p>
          </div>
        </form>
      </PaperCard>
    </div>
  )
}
