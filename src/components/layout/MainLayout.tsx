import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt'

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <Outlet />
      </main>
      <PwaInstallPrompt />
    </div>
  )
}
