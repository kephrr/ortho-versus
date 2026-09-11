import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { LLMValidationResultSchema, type LLMValidationResult } from '../types.js'

export class SemanticValidator {
  private client: OpenAI | null = null

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY
    if (key) {
      this.client = new OpenAI({ apiKey: key })
    }
  }

  private getClient(overrideKey?: string): OpenAI {
    if (overrideKey) {
      return new OpenAI({ apiKey: overrideKey })
    }
    if (this.client) {
      return this.client
    }
    const envKey = process.env.OPENAI_API_KEY
    if (!envKey) {
      throw new Error(
        'OPENAI_API_KEY manquant. Définissez la variable OPENAI_API_KEY dans votre environnement ou passez-la en option.'
      )
    }
    this.client = new OpenAI({ apiKey: envKey })
    return this.client
  }

  /**
   * Validates a raw audio transcript using gpt-4o-mini with structured outputs.
   */
  async validate(rawTranscript: string, apiKey?: string): Promise<LLMValidationResult> {
    const openai = this.getClient(apiKey)

    console.log(`[SemanticValidator] Évaluation sémantique et orthographique avec gpt-4o-mini...`)

    const systemPrompt = `Tu es l'expert linguiste et examinateur officiel du jeu Ortho Versus (concours multijoueur de dictée en français).

Ton rôle est d'analyser la transcription brute d'un extrait audio afin de déterminer s'il est parfaitement adapté pour une dictée en temps réel.

CRITÈRES STRICTS D'ACCEPTATION ('READY') :
1. Unicité du locuteur : L'extrait doit correspondre à la voix d'un seul locuteur (pas de dialogue, pas de voix qui se coupent la parole).
2. Pensée complète et syntaxe fermée : L'extrait DOIT former un ensemble complet de phrases. Il doit commencer au début d'une phrase naturelle et se terminer par un point final logique. Si l'extrait commence ou se termine en plein milieu d'une proposition inachevée (ex: "parce que nous...", "...et donc il"), il DOIT être REJETÉ ('REJECTED').
3. Qualité et diction : Le texte doit avoir du sens, sans interjections parasites excessives ("euh", bégaiements récurrents).
4. Langue : Français soigné et naturel.

CONSIGNES POUR 'targetTranscript' (Texte de référence pour la dictée) :
- Corrige toute faute éventuelle de transcription de Whisper.
- Applique une ponctuation irréprochable (majuscules en début de phrase et aux noms propres, virgules adaptées, points finaux).
- Respecte scrupuleusement l'orthographe française, les accords grammaticaux, les accents (é, è, ê, à, etc.) et les cédilles.
- Ne rajoute pas d'informations qui n'ont pas été prononcées, mais rectifie la ponctuation et l'orthographe pour obtenir le texte parfait.

CLASSIFICATION DE LA DIFFICULTÉ :
- 'FACILE' : Vocabulaire du quotidien, temps simples (présent, futur simple), accords directs sujet-verbe, syntaxe linéaire.
- 'MOYEN' : Vocabulaire varié et soigné, propositions subordonnées, temps composés (passé composé, imparfait, conditionnel, subjonctif présent), accords des participes passés usuels.
- 'DIFFICILE' : Registre soutenu ou littéraire, pièges orthographiques (homophones, consonnes doubles), temps rares (passé simple, subjonctif imparfait), accords délicats (verbes pronominaux, participes passés invariables ou complexes).

STATUT :
- 'READY' si TOUS les critères sont satisfaits.
- 'REJECTED' si la phrase est tronquée, inintelligible, ou s'il y a manifestement plusieurs locuteurs. Dans ce cas, fournis un 'rejectionReason' clair et explicite.`

    const completion = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Voici la transcription brute issue de Whisper pour cet extrait audio de 30 à 60 secondes :\n\n"""\n${rawTranscript}\n"""\n\nÉvalue cet extrait et produis l'analyse structurée.`,
        },
      ],
      response_format: zodResponseFormat(LLMValidationResultSchema, 'audio_validation'),
      temperature: 0.1,
    })

    const result = completion.choices[0].message.parsed

    if (!result) {
      throw new Error("Impossible d'obtenir une réponse structurée valide depuis gpt-4o-mini")
    }

    console.log(
      `[SemanticValidator] Résultat : ${result.status} | Difficulté : ${result.difficulty} | Mots : ${result.wordCount}`
    )
    if (result.status === 'REJECTED') {
      console.log(`[SemanticValidator] Raison du rejet : ${result.rejectionReason}`)
    }

    return result
  }
}
