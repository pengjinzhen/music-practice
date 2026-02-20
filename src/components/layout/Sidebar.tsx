import { NavLink } from 'react-router-dom'
import { Home, Library, Music, Disc3, User, Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

const navItems = [
  { to: '/', labelKey: 'nav.dashboard', icon: Home },
  { to: '/library', labelKey: 'nav.library', icon: Library },
  { to: '/practice', labelKey: 'nav.practice', icon: Music },
  { to: '/tuner', labelKey: 'nav.tuner', icon: Disc3 },
  { to: '/profile', labelKey: 'nav.profile', icon: User },
]

export default function Sidebar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar (>=1280px) */}
      <aside className="hidden h-screen w-60 flex-col bg-sidebar text-white xl:flex">
        <div className="flex h-14 items-center px-4 text-lg font-bold">{t('app.name')}</div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-sidebar-hover text-white' : 'text-white/70 hover:bg-sidebar-hover hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Tablet collapsible sidebar (768-1279px) */}
      <div className="hidden md:block xl:hidden">
        <button
          className="fixed left-3 top-3 z-50 rounded-lg bg-sidebar p-2 text-white"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
            <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-sidebar text-white">
              <div className="flex h-14 items-center px-4 text-lg font-bold">{t('app.name')}</div>
              <nav className="space-y-1 px-2 py-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive ? 'bg-sidebar-hover text-white' : 'text-white/70 hover:bg-sidebar-hover'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{t(item.labelKey)}</span>
                  </NavLink>
                ))}
              </nav>
            </aside>
          </>
        )}
      </div>

      {/* Mobile bottom nav (<768px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-background md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
