import { deriveStatus, shuffleArray, truncate, formatDate } from '@/lib/utils'
import { Attempt } from '@/lib/types'

const mockAttempt = (is_correct: boolean): Attempt => ({
  id: '1',
  question_id: 'q1',
  is_correct,
  answer_given: 'A',
  created_at: '2026-01-01T10:00:00Z',
})

describe('deriveStatus', () => {
  it('returns unanswered when no attempt', () => {
    expect(deriveStatus(null)).toBe('unanswered')
  })
  it('returns correct when last attempt is correct', () => {
    expect(deriveStatus(mockAttempt(true))).toBe('correct')
  })
  it('returns incorrect when last attempt is incorrect', () => {
    expect(deriveStatus(mockAttempt(false))).toBe('incorrect')
  })
})

describe('shuffleArray', () => {
  it('returns array with same elements', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = shuffleArray(arr)
    expect(result).toHaveLength(arr.length)
    expect([...result].sort((a, b) => a - b)).toEqual([...arr].sort((a, b) => a - b))
  })
  it('does not mutate original array', () => {
    const arr = [1, 2, 3]
    const copy = [...arr]
    shuffleArray(arr)
    expect(arr).toEqual(copy)
  })
})

describe('truncate', () => {
  it('returns full string when within limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })
  it('truncates and appends ellipsis when over limit', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })
})

describe('formatDate', () => {
  it('returns a non-empty string', () => {
    expect(formatDate('2026-01-15T10:00:00Z')).toBeTruthy()
  })
})
