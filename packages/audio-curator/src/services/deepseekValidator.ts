import OpenAI from 'openai';
import { z } from 'zod';
import { env } from '../config.js';
import type { AudioDifficulty } from '@app/shared';

const client = new OpenAI({
  apiKey: env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

export const ValidationResponseSchema = z.object({
  isValid: z.boolean(),
  targetTranscript: z.string().optional(),
  difficulty: z.enum(['FACILE', 'MOYEN', 'DIFFICILE']).optional(),
  topic: z.string().optional(),
  wordCount: z.number().optional(),
  rejectionReason: z.string().optional()
});

export type ValidationResponse = z.infer<typeof ValidationResponseSchema>;

export async function validateTranscript(rawTranscript: string): Promise<ValidationResponse> {
  console.log(`[DeepSeekValidator] Évaluation sémantique et orthographique en cours...`);
  const systemPrompt = `Tu es l'expert académicien en orthographe française et juge de dictée.

Tâche : Analyser la transcription brute issue d'un extrait audio de 45 à 90 secondes.
Tu dois répondre STRICTEMENT sous forme d'un objet JSON.

Critères d'invalidation (isValid: false) :
- Phrases coupées au début ou à la fin (rupture syntaxique inachevée)
- Plusieurs interlocuteurs qui se coupent la parole (discours confus)
- Énoncé incompréhensible ou dénué de sens hors de son contexte long
- Bruits parasites décrits dans le texte

Critères de validation (isValid: true) :
Si l'extrait est parfait pour une dictée, fournis :
- targetTranscript : le texte nettoyé et parfait (accords grammaticaux rigoureux, ponctuation soignée, majuscules, accents, cédilles). Ne rajoute pas de choses non prononcées.
- difficulty : 'FACILE', 'MOYEN', ou 'DIFFICILE'. (Facile=temps simples, Moyen=participe passé usuel ou temps composés, Difficile=temps rares, mots rares, accords complexes).
- topic : le thème en un ou deux mots (ex: Histoire, Sciences, etc.).
- wordCount : le nombre exact de mots dans 'targetTranscript'.
- (Si invalide, renseigne plutôt 'rejectionReason' expliquant brièvement pourquoi).

Format attendu :
{
  "isValid": true/false,
  "targetTranscript": "...",
  "difficulty": "FACILE",
  "topic": "...",
  "wordCount": 100,
  "rejectionReason": "..."
}`;

  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Transcription brute associée à cet extrait :\n\n"""\n${rawTranscript}\n"""\n\nProduis l'analyse JSON.` }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('Réponse vide du modèle de validation DeepSeek.');
  }

  const parsed = JSON.parse(content);
  return ValidationResponseSchema.parse(parsed);
}
