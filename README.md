# Ortho Versus 🏆

Monorepo **PNPM** pour l'application multijoueur de tournoi d'orthographe en temps réel ("Ortho Versus"), combinant **AdonisJS v6** (WebSockets / Socket.io) et **Next.js (App Router / Tailwind CSS)** avec partage de typage de bout en bout via `@app/shared`.

---

## 📁 Architecture du Monorepo

```text
ortho-versus-monorepo/
├── package.json             # Scripts racine (dev, build, typecheck, lint)
├── pnpm-workspace.yaml      # Déclaration des workspaces apps/* et packages/*
├── tsconfig.base.json       # Base TypeScript partagée (NodeNext, ES2022)
├── apps/
│   ├── backend/             # AdonisJS v6 (API REST, Socket.io, Room Manager)
│   │   ├── app/
│   │   │   └── services/room_manager.ts
│   │   ├── start/
│   │   │   ├── routes.ts
│   │   │   └── ws.ts        # Passerelle Socket.io typée
│   │   └── package.json
│   └── frontend/            # Next.js App Router (React 19, Tailwind v4, Socket.io client)
│       ├── app/
│       │   ├── page.tsx     # Arène de tournoi réactive
│       │   └── layout.tsx
│       ├── components/
│       │   ├── LobbyJoin.tsx
│       │   ├── RoomLobby.tsx
│       │   ├── GameActive.tsx
│       │   └── GameResults.tsx
│       ├── context/
│       │   └── socket-context.tsx
│       └── package.json
└── packages/
    └── shared/              # Typage strict partagé, Contrats WS & Scoring
        ├── src/
        │   ├── types.ts     # RoomStatus, Player, RoomState, PlayerResult
        │   ├── events.ts    # ClientToServerEvents & ServerToClientEvents
        │   ├── scoring.ts   # Distance de Levenshtein & calcul de précision
        │   └── index.ts
        ├── package.json
        └── tsconfig.json
```

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- **Node.js** >= 20.x (testé avec Node v22.18)
- **PNPM** >= 9.x / 11.x

### 2. Installation des dépendances
```bash
pnpm install
```

### 3. Lancer le projet en développement

- **Lancer Backend & Frontend en parallèle :**
```bash
pnpm dev
```

- **Ou lancer individuellement :**
```bash
# Backend seul (AdonisJS v6 sur http://localhost:3333)
pnpm dev:back

# Frontend seul (Next.js sur http://localhost:3000)
pnpm dev:front
```

### 4. Vérification du typage (Zero error)
```bash
pnpm run typecheck
```

### 5. Build de production
```bash
pnpm run build
```

---

## 🛡️ Règle de Sécurité Anti-Triche

Le backend applique une étanchéité stricte :
- `targetTranscript` n'est **jamais** envoyé dans `room:state_sync` ni dans `game:started`.
- Seul l'événement final `game:results` révèle la transcription officielle une fois les copies des joueurs récupérées et évaluées.

---

## 🧠 Algorithme d'Évaluation & Scoring

Le package `@app/shared/src/scoring.ts` implémente :
1. **Normalisation de texte** : Gestion des ligatures (œ -> oe, æ -> ae), ponctuation standardisée, suppression des espaces superflus.
2. **Distance de Levenshtein** : Calcul des opérations élémentaires (insertions, suppressions, substitutions).
3. **Calcul de Précision** : Score normalisé sur 100% avec comptage exact des erreurs de mots.
