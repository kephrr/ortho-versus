import type { GameResultsPayload, Player, RoomState } from '@app/shared'

export const MOCK_PLAYERS: Player[] = [
  {
    id: 'p_lea',
    socketId: 'socket_lea',
    nickname: 'Léa',
    avatar: '🦊',
    isHost: true,
  },
  {
    id: 'p_malo',
    socketId: 'socket_malo',
    nickname: 'Malo',
    avatar: '🐸',
    isHost: false,
  },
  {
    id: 'p_ines',
    socketId: 'socket_ines',
    nickname: 'Inès',
    avatar: '🐼',
    isHost: false,
  },
  {
    id: 'p_noah',
    socketId: 'socket_noah',
    nickname: 'Noah',
    avatar: '🦉',
    isHost: false,
  },
]

export const MOCK_ROOM: RoomState = {
  code: 'K7QX',
  status: 'LOBBY',
  maxPlayers: 8,
  players: MOCK_PLAYERS,
  audioDurationSeconds: 20,
  writingDurationSeconds: 45,
  audioUrl: '/audios/video_extrait_20s.mp3',
}

export const MOCK_TARGET =
  'On comprend absolument tout et c’est légitime de vous poser la question. Est-ce que Pierre voulait racheter le Multipla ?'

export const MOCK_INPUT =
  'On comprend absolument tout et c’est légitime de vous poser la question. Est-ce que Pierre voulait racheter le'

export const MOCK_RESULTS: GameResultsPayload = {
  targetTranscript: MOCK_TARGET,
  results: [
    {
      playerId: 'p_lea',
      nickname: 'Léa',
      avatar: '🦊',
      wordErrorCount: 0,
      accuracyScore: 100,
      submittedText: MOCK_TARGET,
    },
    {
      playerId: 'p_malo',
      nickname: 'Malo',
      avatar: '🐸',
      wordErrorCount: 2,
      accuracyScore: 91,
      submittedText:
        'On comprend absolument tout et c’est légitime de vous poser la question. Est-ce que Pierre voulait racheter le multipla ?',
    },
    {
      playerId: 'p_ines',
      nickname: 'Inès',
      avatar: '🐼',
      wordErrorCount: 5,
      accuracyScore: 78,
      submittedText:
        'On comprend absolument tout et c’est légitime de vous poser la question. Est ce que Pierre voulait racheter le Multipla ?',
    },
    {
      playerId: 'p_noah',
      nickname: 'Noah',
      avatar: '🦉',
      wordErrorCount: 9,
      accuracyScore: 61,
      submittedText:
        'On comprends absolument tout et c’est légitime de vous poser la question. Est-ce que Pierre voulait racheter le multiplat ?',
    },
  ],
}

export const MOCK_CURRENT_PLAYER = 'Léa'
