/**
 * Scoring-engine квізу.
 *
 * Кожен профіль має набір «сильних сигналів» із ТЗ — ключів вигляду `<питання><варіант>`.
 * Бал профілю = кількість сигналів, які збіглися з відповідями людини.
 *
 * Правило при нічиї (з ТЗ):
 *   1. поточна ситуація — питання 2
 *   2. головна зміна   — питання 4
 *   3. головна перешкода — питання 6
 *   4. якщо все ще нічия — порядок профілів у ТЗ
 */

import { profiles, type BusinessProfile, type ProfileId } from '../data/profiles'

export type Answers = Record<number, string>

export const PROFILE_SIGNALS: Record<ProfileId, readonly string[]> = {
  // 🔄 Профіль 1 — Перезапуск без обнулення
  restart: ['2c', '2d', '3a', '8d', '13b', '13c', '13d', '14e'],

  // 🎯 Профіль 2 — Рекрутинг нового покоління
  recruiting: ['4c', '5b', '6a', '6d', '6e', '8e', '9a', '9b', '12e'],

  // 🧭 Профіль 3 — Архітектор сильного старту
  onboarding: ['4a', '5c', '6b', '7c', '9c', '9d', '12d'],

  // 👑 Профіль 4 — Повернення в роль лідера
  leader: ['4e', '5a', '5e', '6f', '6g', '7a', '7c', '8a', '10b', '14b', '14c'],

  // 🤖 Профіль 5 — Архітектор AI-системи
  // «9 — будь-який конкретний варіант автоматизації» = a…e (крім f «поки не розумію»)
  ai: ['4d', '5d', '7e', '9a', '9b', '9c', '9d', '9e', '10d', '12f', '14d'],

  // 🚀 Профіль 6 — Лідер нового масштабу
  scale: [
    '2e',
    '2f',
    '3c',
    '4b',
    '4c',
    '5e',
    '7b',
    '7d',
    '8c',
    '8e',
    '8f',
    '10b',
    '10c',
    '10e',
    '11d',
    '11e',
    '12b',
    '12c',
    '13a',
    '13b',
    '13c',
    '14e',
  ],
}

/** Порядок питань для tie-break: поточна ситуація → головна зміна → головна перешкода */
export const TIE_BREAK_QUESTIONS = [2, 4, 6] as const

export interface ScoreBreakdown {
  profileId: ProfileId
  score: number
  /** Які саме сигнали збіглися — показуємо в аналізі та зберігаємо в сесію */
  matched: string[]
}

export interface QuizResult {
  profile: BusinessProfile
  profileId: ProfileId
  scores: ScoreBreakdown[]
  /** true, якщо профіль визначено правилом нічиї */
  resolvedByTieBreak: boolean
  tieBreakQuestion: number | null
}

function answerKeys(answers: Answers): Set<string> {
  const keys = new Set<string>()
  for (const [questionId, optionId] of Object.entries(answers)) {
    if (optionId) keys.add(`${questionId}${optionId}`)
  }
  return keys
}

export function scoreAnswers(answers: Answers): ScoreBreakdown[] {
  const keys = answerKeys(answers)

  return profiles
    .map<ScoreBreakdown>((profile) => {
      const matched = PROFILE_SIGNALS[profile.id].filter((signal) => keys.has(signal))
      return { profileId: profile.id, score: matched.length, matched }
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return orderOf(a.profileId) - orderOf(b.profileId)
    })
}

function orderOf(id: ProfileId): number {
  return profiles.find((p) => p.id === id)?.order ?? 99
}

export function calculateResult(answers: Answers): QuizResult {
  const scores = scoreAnswers(answers)
  const top = scores[0]!
  let tied = scores.filter((s) => s.score === top.score).map((s) => s.profileId)

  let resolvedByTieBreak = false
  let tieBreakQuestion: number | null = null

  if (tied.length > 1) {
    for (const questionId of TIE_BREAK_QUESTIONS) {
      const answer = answers[questionId]
      if (!answer) continue

      const key = `${questionId}${answer}`
      const narrowed = tied.filter((id) => PROFILE_SIGNALS[id].includes(key))

      if (narrowed.length > 0 && narrowed.length < tied.length) {
        tied = narrowed
        resolvedByTieBreak = true
        tieBreakQuestion = questionId
      }
      if (tied.length === 1) break
    }

    // Якщо сигнали не розвели профілі — беремо за порядком у ТЗ
    tied.sort((a, b) => orderOf(a) - orderOf(b))
  }

  const winnerId = tied[0]!
  const profile = profiles.find((p) => p.id === winnerId)!

  return { profile, profileId: winnerId, scores, resolvedByTieBreak, tieBreakQuestion }
}

/**
 * Профілі, які набрали бали, але не стали основним результатом.
 * Показуємо їх у повному аналізі як «рекомендовані інструменти всередині результату»
 * (напр. AI показується всередині «Перезапуску без обнулення» — приклад із ТЗ).
 */
export function secondaryProfiles(result: QuizResult, limit = 2): BusinessProfile[] {
  return result.scores
    .filter((s) => s.profileId !== result.profileId && s.score > 0)
    .slice(0, limit)
    .map((s) => profiles.find((p) => p.id === s.profileId)!)
}
