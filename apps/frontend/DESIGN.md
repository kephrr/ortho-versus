# Design system — Ortho Versus

Direction : **papier & encre**. Un fond crème texturé, des cartes à bordure franche et ombre pleine, une typographie expressive, et trois accents qui structurent le jeu : corail (action), bleu (temps/précision), jaune (récompense).

## Repères

- **Accueil** : `/`
- **Aperçu de tous les écrans** : `/preview` (données fictives, navigation en bas)
- **Aperçu sans barre d'outils** : `/preview?screen=game&bare=1` (écrans : `join`, `lobby`, `countdown`, `game`, `evaluating`, `results`)
- Les tokens sont dans `app/globals.css`, les composants réutilisables dans `components/ui/`, les écrans présentationnels dans `components/views/`.

## Palette

| Rôle | Token | Valeur |
| --- | --- | --- |
| Fond papier | `--color-paper` | `#F6F1E7` |
| Surface carte | `--color-cream` | `#FFFBF2` |
| Encre | `--color-ink` | `#1C1913` |
| Texte secondaire | `--color-ink-soft` | `#5C5548` |
| Action | `--color-coral` | `#FF5A36` |
| Temps / précision | `--color-cobalt` | `#2E4FF0` |
| Récompense | `--color-butter` | `#FFC94A` |
| Succès | `--color-mint` | `#1FA97A` |
| Erreur | `--color-rose` | `#D93A3F` |

## Typographie

- **Display** : Bricolage Grotesque (`font-display`) — titres, boutons, chiffres.
- **Texte** : Instrument Sans (`font-sans`) — interface, dictée, paragraphes.
- **Citations** : Instrument Serif (`font-serif`) — texte officiel de la dictée.

## Composants clés

- `PaperCard` : carte crème, bordure 2 px encre, ombre décalée.
- `Button` : variantes `primary`, `ink`, `butter`, `ghost`, `cream`, `darkGhost`.
- `Avatar` : tuiles pastel par animal, tailles `xs` → `xl`.
- `Chip` : étiquettes majuscules, tons corail / beurre / cobalt / menthe.
- `SoundWave` : égaliseur animé pendant la lecture audio.
- `TimerRing` : anneau de temps bleu qui passe au rose sous 10 secondes.
- `AppShell` : fond, en-tête logo, code de salon, pied de page.

## Principes

1. Une seule action principale par écran.
2. Le code de salon est toujours visible et copiable en un clic.
3. Le temps restant et l'audio sont les deux informations prioritaires en jeu.
4. Les états vides et les attentes sont explicites, jamais silencieux.
5. Animations courtes, désactivées si `prefers-reduced-motion`.
