import { describe, it, expect } from 'vitest'
import { generateSuggestionsFromScores } from '@/engines/SuggestionEngine'

describe('SuggestionEngine', () => {
  it('returns no suggestions when all scores are high', () => {
    const suggestions = generateSuggestionsFromScores({
      speed: 19, rhythm: 18, intonation: 20, smoothness: 19, completeness: 18,
    })
    expect(suggestions).toHaveLength(0)
  })

  it('returns suggestions for low-scoring dimensions', () => {
    const suggestions = generateSuggestionsFromScores({
      speed: 10, rhythm: 18, intonation: 5, smoothness: 19, completeness: 18,
    })
    expect(suggestions.length).toBe(2)
    expect(suggestions[0].dimension).toBe('intonation') // lowest score = highest priority
    expect(suggestions[1].dimension).toBe('speed')
  })

  it('sorts suggestions by priority (worst first)', () => {
    const suggestions = generateSuggestionsFromScores({
      speed: 15, rhythm: 8, intonation: 12, smoothness: 5, completeness: 17,
    })
    for (let i = 1; i < suggestions.length; i++) {
      expect(suggestions[i - 1].priority).toBeGreaterThanOrEqual(suggestions[i].priority)
    }
  })

  it('provides bilingual text for each suggestion', () => {
    const suggestions = generateSuggestionsFromScores({
      speed: 10, rhythm: 18, intonation: 18, smoothness: 18, completeness: 18,
    })
    expect(suggestions[0].titleEn).toBeTruthy()
    expect(suggestions[0].titleZh).toBeTruthy()
    expect(suggestions[0].descriptionEn).toBeTruthy()
    expect(suggestions[0].descriptionZh).toBeTruthy()
  })
})
