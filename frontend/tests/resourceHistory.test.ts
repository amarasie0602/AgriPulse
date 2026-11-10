import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resourceHistory } from '../src/utils/resourceHistory'
import { monthlyCarbonTrend, monthlyResourceTrends } from '../src/utils/analytics'
import type { ResourceEntry } from '../src/types/resource'
const entry = (date: string, quantity: number, resourceType: ResourceEntry['resourceType'] = 'WATER', unit = 'L'): ResourceEntry => ({ id: `${date}-${quantity}`, resourceType, quantity, unit, date, createdAt: '2026-10-20T00:00:00Z' })
const water = (entries: ResourceEntry[], period: 'day' | 'week' | 'month' = 'day') => resourceHistory(entries, period).find(s => s.type === 'WATER' && s.unit === 'L')!

test('empty history exposes all five required resources without invented values', () => {
  const result = resourceHistory([], 'day')
  assert.equal(result.length, 5)
  assert.ok(result.every(s => s.points.length === 0 && s.total === 0 && s.recordCount === 0))
})
test('uses usage dates, sorts records, and sums only the same calendar day', () => {
  const result = water([entry('2026-10-03T00:00:00Z', 30), entry('2026-10-01T18:00:00Z', 10), entry('2026-10-01T06:00:00Z', 15)])
  assert.equal(result.total, 55)
  assert.equal(result.recordCount, 3)
  assert.equal(result.periodCount, 2)
  assert.deepEqual(result.points.map(p => [p.key, p.value]), [['2026-10-01', 25], ['2026-10-02', null], ['2026-10-03', 30]])
})
test('one record remains one observation, without a baseline zero or a ramp to today', () => {
  const result = water([entry('2024-03-02', 40)])
  assert.equal(result.points.length, 1)
  assert.equal(result.points[0].value, 40)
  assert.equal(result.periodCount, 1)
})
test('same-day entries do not pretend to be multiple historical periods', () => {
  assert.equal(water([entry('2026-10-02', 10), entry('2026-10-02', 20)]).periodCount, 1)
})
test('preserves recorded zero while distinguishing unrecorded gaps', () => {
  assert.deepEqual(water([entry('2026-10-01', 0), entry('2026-10-03', 20)]).points.map(p => p.value), [0, null, 20])
})
test('case and whitespace normalize matching units but different units never combine', () => {
  const result = resourceHistory([entry('2026-10-01', 10, 'WATER', ' l '), entry('2026-10-01', 2, 'WATER', 'm3'), entry('2026-10-02', 5)], 'day').filter(s => s.type === 'WATER')
  assert.equal(result.length, 2)
  assert.equal(result.find(s => s.unit === 'L')?.total, 15)
  assert.equal(result.find(s => s.unit === 'm3')?.total, 2)
})
test('weekly aggregation starts on Monday and crosses the year correctly', () => {
  const result = water([entry('2025-12-31', 10), entry('2026-01-04', 20), entry('2026-01-05', 30)], 'week')
  assert.deepEqual(result.points.map(p => [p.key, p.value]), [['2025-12-29', 30], ['2026-01-05', 30]])
})
test('monthly aggregation crosses December and represents missing months as null', () => {
  const result = water([entry('2025-12-20', 10), entry('2026-02-02', 30)], 'month')
  assert.deepEqual(result.points.map(p => [p.key, p.value]), [['2025-12-01', 10], ['2026-01-01', null], ['2026-02-01', 30]])
})
test('does not expand sparse decades into thousands of empty chart points', () => {
  assert.equal(water([entry('2000-01-01', 10), entry('2026-10-01', 20)]).points.length, 3)
})
test('ignores invalid dates, negative values, nonfinite quantities and empty units', () => {
  const result = water([entry('bad-date', 10), entry('2026-10-01', -1), entry('2026-10-02', NaN), entry('2026-10-03', Infinity), entry('2026-10-04', 10, 'WATER', ''), entry('2026-10-05', 15)])
  assert.equal(result.recordCount, 1)
  assert.equal(result.total, 15)
})
test('each resource retains its own observations, unit, and total', () => {
  const result = resourceHistory([entry('2026-10-01', 100), entry('2026-10-02', 15, 'FERTILIZER', 'kg'), entry('2026-10-03', 45, 'ENERGY', 'kWh'), entry('2026-10-04', 8, 'FUEL'), entry('2026-10-05', 0.3, 'PESTICIDE')], 'day')
  assert.deepEqual(result.map(s => [s.type, s.total, s.unit]), [['WATER', 100, 'L'], ['FERTILIZER', 15, 'kg'], ['ENERGY', 45, 'kWh'], ['FUEL', 8, 'L'], ['PESTICIDE', 0.3, 'L']])
})
test('dashboard resource trends also preserve gaps and non-default units', () => {
  const result = monthlyResourceTrends([entry('2026-01-01', 10), entry('2026-03-01', 30), entry('2026-03-01', 2, 'WATER', 'm3')])
  assert.equal(result.length, 2)
  assert.deepEqual(result.find(s => s.unit === 'L')?.points.map(p => p.value), [10, null, 30])
})
test('carbon history uses existing factors and excludes unsupported inputs and units', () => {
  const result = monthlyCarbonTrend([entry('2026-01-01', 10, 'FUEL'), entry('2026-03-01', 20, 'FUEL'), entry('2026-03-01', 999), entry('2026-03-01', 100, 'FUEL', 'gallons')])
  assert.deepEqual(result.map(p => p.value), [26.8, null, 53.6])
})
