import { monthOverMonthChange, type TrendPoint } from './analytics'

export interface SustainabilityScoreResult {
  /** 0-100, a simple illustrative heuristic — not a certified rating. */
  score: number
  /** Month-over-month change in estimated carbon footprint, as a percent. Null until two months of data exist. */
  changePercent: number | null
}

const BASELINE_SCORE = 70

/**
 * A deliberately simple, illustrative score: it rewards a falling carbon
 * footprint month-over-month and penalizes a rising one, centered on a
 * neutral baseline. Not a certified sustainability rating — same honesty
 * convention as the Carbon Calculator's emission factors.
 */
export function estimateSustainabilityScore(carbonTrend: TrendPoint[]): SustainabilityScoreResult {
  const changePercent = monthOverMonthChange(carbonTrend)
  if (changePercent === null) {
    return { score: BASELINE_SCORE, changePercent: null }
  }

  const score = Math.round(Math.min(100, Math.max(0, BASELINE_SCORE - changePercent * 0.6)))
  return { score, changePercent }
}
