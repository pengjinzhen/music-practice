import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Flame, Check } from 'lucide-react'
import { PracticeRepository } from '@/db/repositories/PracticeRepository'

export function StreakCalendar() {
  const { t } = useTranslation()

  const { currentStreak, longestStreak, todayDone, calendarDays } = useMemo(() => {
    const daily = PracticeRepository.getDailyDurations(90)
    const dates = new Set(daily.map((d) => d.date))
    const today = new Date()
    const todayKey = today.toISOString().slice(0, 10)
    let cur = 0
    for (let i = 0; i < 90; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      if (dates.has(d.toISOString().slice(0, 10))) cur++
      else break
    }
    let longest = 0
    let streak = 0
    for (let i = 0; i < 90; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      if (dates.has(d.toISOString().slice(0, 10))) {
        streak++
        longest = Math.max(longest, streak)
      } else {
        streak = 0
      }
    }
    // Build calendar grid for current month
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: { day: number; practiced: boolean; future: boolean }[] = []
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({ day: d, practiced: dates.has(key), future: d > today.getDate() })
    }
    return {
      currentStreak: cur,
      longestStreak: longest,
      todayDone: dates.has(todayKey),
      calendarDays: { firstDay, days },
    }
  }, [])

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="space-y-4">
      {/* Streak stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Flame className={`h-5 w-5 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
          <div>
            <p className="text-lg font-bold">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">{t('streak.current_streak')}</p>
          </div>
        </div>
        <div>
          <p className="text-lg font-bold">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">{t('streak.longest_streak')}</p>
        </div>
        <div className="ml-auto">
          {todayDone ? (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Check className="h-4 w-4" /> {t('streak.today_done')}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{t('streak.today_pending')}</span>
          )}
        </div>
      </div>

      {/* Calendar grid */}
      <div>
        <p className="mb-2 text-sm font-medium">{t('streak.this_month')}</p>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {weekDays.map((d) => (
            <div key={d} className="py-1 text-muted-foreground">{d}</div>
          ))}
          {Array.from({ length: calendarDays.firstDay }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {calendarDays.days.map((d) => (
            <div
              key={d.day}
              className={`rounded py-1 ${
                d.future ? 'text-muted-foreground/40' :
                d.practiced ? 'bg-green-100 font-medium text-green-700' : ''
              }`}
            >
              {d.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
