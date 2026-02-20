import { Outlet, NavLink } from 'react-router-dom'

const mobileNavItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/library', label: 'Library', icon: '🎵' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

export default function MobileLayout() {
  return (
    <div className="flex h-screen flex-col">
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
      <nav className="flex border-t bg-white">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
