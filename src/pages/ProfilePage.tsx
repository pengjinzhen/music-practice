import { useState, useMemo, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/useAppStore'
import { UserRepository } from '@/db/repositories/UserRepository'
import { PracticeRepository } from '@/db/repositories/PracticeRepository'
import { AchievementRepository } from '@/db/repositories/AchievementRepository'
import { AchievementEngine } from '@/engines/AchievementEngine'
import { GrowthChart } from '@/components/profile/GrowthChart'
import { PracticeTimeline } from '@/components/profile/PracticeTimeline'
import { StreakCalendar } from '@/components/achievement/StreakCalendar'
import { AchievementBadge } from '@/components/achievement/AchievementBadge'
import type { SkillLevel, Language, InstrumentType } from '@/stores/useAppStore'
import { exportData, importData } from '@/services/dataService'

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { instrument, skillLevel, language, setInstrument, setSkillLevel, setLanguage } = useAppStore()
  const [nickname, setNickname] = useState(() => {
    try { return UserRepository.get().nickname } catch { return 'Musician' }
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stats = useMemo(() => ({
    totalSeconds: PracticeRepository.getTotalDuration(),
    totalSessions: PracticeRepository.getTotalSessions(),
    trackCount: PracticeRepository.getDistinctTrackCount(),
  }), [])

  const dimensionHistory = useMemo(() => PracticeRepository.getDimensionHistory(90), [])

  const achievements = useMemo(() => {
    const engine = new AchievementEngine()
    const defs = engine.getDefinitions()
    const unlocked = AchievementRepository.getAll()
    const unlockedMap = new Map(unlocked.map((a) => [a.id, a]))
    return defs.map((d) => ({ ...d, record: unlockedMap.get(d.id) ?? null }))
  }, [])

  const handleNicknameChange = useCallback((value: string) => {
    setNickname(value)
    UserRepository.update({ nickname: value })
  }, [])

  const handleSkillChange = useCallback((level: SkillLevel) => {
    setSkillLevel(level)
    UserRepository.update({ skill_level: level })
  }, [setSkillLevel])

  const handleLangChange = useCallback((lang: Language) => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    UserRepository.update({ language: lang })
  }, [setLanguage, i18n])

  const handleInstrumentChange = useCallback((inst: InstrumentType) => {
    setInstrument(inst)
    UserRepository.update({ instrument: inst })
  }, [setInstrument])

  const hours = Math.floor(stats.totalSeconds / 3600)
  const mins = Math.floor((stats.totalSeconds % 3600) / 60)

  const skillLevels: SkillLevel[] = ['beginner', 'intermediate', 'advanced']
  const languages: { key: Language; label: string }[] = [
    { key: 'en', label: 'English' },
    { key: 'zh', label: '中文' },
  ]
  const instruments: { key: InstrumentType; label: string }[] = [
    { key: 'piano', label: t('instrument.piano') },
    { key: 'cello', label: t('instrument.cello') },
  ]

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">{t('profile.title')}</h1>

      {/* Personal info */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('profile.nickname')}</label>
            <input
              className="w-full max-w-xs rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('profile.skill_level')}</label>
            <div className="flex gap-2">
              {skillLevels.map((l) => (
                <button
                  key={l}
                  className={`rounded-lg px-4 py-2 text-sm ${skillLevel === l ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  onClick={() => handleSkillChange(l)}
                >
                  {t(`difficulty.${l}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('profile.instrument_pref')}</label>
            <div className="flex gap-2">
              {instruments.map((i) => (
                <button
                  key={i.key}
                  className={`rounded-lg px-4 py-2 text-sm ${instrument === i.key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  onClick={() => handleInstrumentChange(i.key)}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('profile.language')}</label>
            <div className="flex gap-2">
              {languages.map((l) => (
                <button
                  key={l.key}
                  className={`rounded-lg px-4 py-2 text-sm ${language === l.key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  onClick={() => handleLangChange(l.key)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{hours}h {mins}m</p>
            <p className="text-sm text-muted-foreground">{t('profile.total_practice_time')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{stats.totalSessions}</p>
            <p className="text-sm text-muted-foreground">{t('dashboard.total_sessions')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{stats.trackCount}</p>
            <p className="text-sm text-muted-foreground">{t('profile.tracks_practiced')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Streak calendar */}
      <Card>
        <CardHeader><CardTitle>{t('streak.title')}</CardTitle></CardHeader>
        <CardContent><StreakCalendar /></CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader><CardTitle>{t('achievement.title')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {achievements.map((a) => (
              <AchievementBadge
                key={a.id}
                title={language === 'zh' ? a.titleZh : a.title}
                description={language === 'zh' ? a.descriptionZh : a.description}
                unlockedAt={a.record?.unlocked_at ?? null}
                isLocked={!a.record}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth chart */}
      {dimensionHistory.length > 0 && (
        <Card>
          <CardHeader><CardTitle>{t('profile.growth_chart')}</CardTitle></CardHeader>
          <CardContent><GrowthChart data={dimensionHistory} /></CardContent>
        </Card>
      )}

      {/* Practice history */}
      <Card>
        <CardHeader><CardTitle>{t('profile.practice_history')}</CardTitle></CardHeader>
        <CardContent><PracticeTimeline /></CardContent>
      </Card>

      {/* Export/Import */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={exportData}>{t('profile.export_data')}</Button>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>{t('profile.import_data')}</Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) importData(file).then(() => window.location.reload())
          }}
        />
      </div>
    </div>
  )
}
