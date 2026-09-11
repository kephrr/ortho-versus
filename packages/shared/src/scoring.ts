/**
 * Normalizes text for spelling evaluation:
 * - Trims extra spaces
 * - Lowercases (optionally)
 * - Normalizes quotes/dashes
 */
export function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
}

/**
 * Computes Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      )
    }
  }

  return dp[m][n]
}

/**
 * Evaluates spelling submission against the target transcript.
 * Returns word error count and an accuracy score from 0 to 100.
 */
export function evaluateSubmission(
  target: string,
  submission: string
): { wordErrorCount: number; accuracyScore: number } {
  const normTarget = normalizeText(target)
  const normSubmission = normalizeText(submission)

  const targetWords = normTarget.length > 0 ? normTarget.split(' ') : []
  const submissionWords = normSubmission.length > 0 ? normSubmission.split(' ') : []

  if (targetWords.length === 0) {
    return {
      wordErrorCount: submissionWords.length,
      accuracyScore: submissionWords.length === 0 ? 100 : 0,
    }
  }

  let errorCount = 0
  const maxWords = Math.max(targetWords.length, submissionWords.length)

  for (let i = 0; i < maxWords; i++) {
    const tWord = targetWords[i]
    const sWord = submissionWords[i]

    if (!tWord || !sWord || tWord !== sWord) {
      errorCount++
    }
  }

  // Character-level accuracy via Levenshtein
  const charDistance = levenshteinDistance(normTarget, normSubmission)
  const maxCharLen = Math.max(normTarget.length, normSubmission.length)
  const accuracy = maxCharLen === 0 ? 100 : Math.max(0, Math.round(((maxCharLen - charDistance) / maxCharLen) * 100))

  return {
    wordErrorCount: errorCount,
    accuracyScore: accuracy,
  }
}
