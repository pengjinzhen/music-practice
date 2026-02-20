import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { WeeklyGoalRepository } from '@/db/repositories/WeeklyGoalRepository'

export function WeeklyGoalCard() {
  const { t } = useTranslation()

  const goal = useMemo(() => {
    const g = WeeklyGoalRepository.getCurrentWeek()
    WeeklyGoalRepository.recalculate(g.week_start)
    return WeeklyGoalRepository.getCurrentWeek()
  }, [])

  const daysPercent = goal.target_days > 0 ? Math.min(100, (goal.actual_days / goal.target_days) * 100) : 0
  const minsPercent = goal.target_minutes > 0 ? Math.min(100, (goal.actual_minutes / goal.target_minutes) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {t('dashboard.weekly_goal')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>{t('dashboard.practice_days')}</span>
            <span>{goal.actual_days}/{goal.target_days} {t('dashboard.days')}</span>
          </div>
          <Progress value={daysPercent} />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>{t('dashboard.practice_time')}</span>
            <span>{goal.actual_minutes}/{goal.target_minutes} {t('dashboard.minutes')}</span>
          </div>
          <Progress value={minsPercent} />
        </div>
        {daysPercent >= 100 && minsPercent >= 100 && (
          <p className="text-center text-sm font-medium text-green-600">{t('dashboard.goal_achieved')}</p>
        )}
      </CardContent>
    </Card>
  )
}
