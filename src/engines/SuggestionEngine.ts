import { PracticeRepository } from '@/db/repositories/PracticeRepository'

export interface PracticeSuggestion {
  dimension: string
  score: number
  priority: number
  titleEn: string
  titleZh: string
  descriptionEn: string
  descriptionZh: string
}

const DIMENSION_KEYS = ['speed', 'rhythm', 'intonation', 'smoothness', 'completeness'] as const

export function generateSuggestions(sessionId: string): PracticeSuggestion[] {
  const session = PracticeRepository.getById(sessionId)
  if (!session) return []

  const dimScores: Record<string, number> = {
    speed: session.speed_score ?? 0,
    rhythm: session.rhythm_score ?? 0,
    intonation: session.intonation_score ?? 0,
    smoothness: session.smoothness_score ?? 0,
    completeness: session.completeness_score ?? 0,
  }

  const suggestions: PracticeSuggestion[] = []

  for (const dim of DIMENSION_KEYS) {
    const score = dimScores[dim]
    if (score >= 18) continue // good enough
    const priority = 20 - score
    suggestions.push({
      dimension: dim,
      score,
      priority,
      ...getSuggestionText(dim, score),
    })
  }

  return suggestions.sort((a, b) => b.priority - a.priority)
}

export function generateSuggestionsFromScores(scores: Record<string, number>): PracticeSuggestion[] {
  const suggestions: PracticeSuggestion[] = []
  for (const dim of DIMENSION_KEYS) {
    const score = scores[dim] ?? 0
    if (score >= 18) continue
    suggestions.push({
      dimension: dim, score, priority: 20 - score,
      ...getSuggestionText(dim, score),
    })
  }
  return suggestions.sort((a, b) => b.priority - a.priority)
}

function getSuggestionText(dim: string, score: number) {
  const isLow = score < 12
  const texts: Record<string, { titleEn: string; titleZh: string; descriptionEn: string; descriptionZh: string }> = {
    speed: {
      titleEn: isLow ? 'Slow down the tempo' : 'Stabilize your tempo',
      titleZh: isLow ? '放慢速度练习' : '稳定演奏速度',
      descriptionEn: isLow ? 'Practice at 50% speed with metronome, gradually increase.' : 'Use metronome to maintain steady BPM throughout.',
      descriptionZh: isLow ? '使用节拍器以50%速度练习，逐步提速。' : '使用节拍器保持全曲稳定的BPM。',
    },
    rhythm: {
      titleEn: isLow ? 'Focus on rhythm patterns' : 'Refine note durations',
      titleZh: isLow ? '专注节奏型练习' : '精确音符时值',
      descriptionEn: isLow ? 'Clap the rhythm before playing. Practice difficult measures separately.' : 'Pay attention to dotted notes and syncopation.',
      descriptionZh: isLow ? '先拍手打节奏，再上手演奏。困难小节单独练习。' : '注意附点音符和切分节奏的准确性。',
    },
    intonation: {
      titleEn: isLow ? 'Check your tuning' : 'Improve pitch accuracy',
      titleZh: isLow ? '检查调音' : '提高音准',
      descriptionEn: isLow ? 'Use the tuner to check instrument tuning. Practice scales slowly.' : 'Listen carefully and adjust. Practice intervals.',
      descriptionZh: isLow ? '使用调音器检查乐器调音。慢速练习音阶。' : '仔细聆听并调整。练习音程。',
    },
    smoothness: {
      titleEn: isLow ? 'Practice legato passages' : 'Reduce hesitations',
      titleZh: isLow ? '练习连奏段落' : '减少停顿',
      descriptionEn: isLow ? 'Focus on smooth transitions between notes. Practice hands separately.' : 'Identify pause points and practice those transitions.',
      descriptionZh: isLow ? '专注音符之间的平滑过渡。分手练习。' : '找出停顿点，针对性练习过渡。',
    },
    completeness: {
      titleEn: isLow ? 'Learn the full piece' : 'Fill in missing sections',
      titleZh: isLow ? '学习完整曲目' : '补全遗漏段落',
      descriptionEn: isLow ? 'Break the piece into sections and learn each one.' : 'Identify skipped measures and practice them.',
      descriptionZh: isLow ? '将曲目分段，逐段学习。' : '找出跳过的小节，针对性练习。',
    },
  }
  return texts[dim] ?? { titleEn: 'Keep practicing', titleZh: '继续练习', descriptionEn: 'Practice more.', descriptionZh: '多加练习。' }
}
