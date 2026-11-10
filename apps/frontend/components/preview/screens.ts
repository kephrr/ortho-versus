export type PreviewScreen =
  | 'join'
  | 'lobby'
  | 'countdown'
  | 'game'
  | 'evaluating'
  | 'results'

export const PREVIEW_SCREENS: { id: PreviewScreen; label: string }[] = [
  { id: 'join', label: 'Accueil' },
  { id: 'lobby', label: 'Salon' },
  { id: 'countdown', label: 'Décompte' },
  { id: 'game', label: 'Manche' },
  { id: 'evaluating', label: 'Correction' },
  { id: 'results', label: 'Résultats' },
]

export function isPreviewScreen(value: string | undefined): value is PreviewScreen {
  return PREVIEW_SCREENS.some((screen) => screen.id === value)
}
