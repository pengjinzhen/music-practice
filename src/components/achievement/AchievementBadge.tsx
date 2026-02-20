import { Trophy } from 'lucide-react'

interface Props {
  title: string
  description: string | null
  unlockedAt: string | null
  isLocked?: boolean
}

export function AchievementBadge({ title, description, unlockedAt, isLocked }: Props) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${isLocked ? 'opacity-40' : ''}`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isLocked ? 'bg-muted' : 'bg-yellow-100'}`}>
        <Trophy className={`h-5 w-5 ${isLocked ? 'text-muted-foreground' : 'text-yellow-600'}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
        {unlockedAt && (
          <p className="text-xs text-muted-foreground">{new Date(unlockedAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  )
}
