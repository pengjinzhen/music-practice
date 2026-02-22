import { Suspense, useEffect, useState } from 'react'
import { HashRouter, useRoutes } from 'react-router-dom'
import { routes } from './routes'
import { initPreloadStrategy } from '@/utils/preload'
import { getDatabase } from '@/db/database'

function AppRoutes() {
  const element = useRoutes(routes)
  return <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>{element}</Suspense>
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getDatabase()
      .then(() => setReady(true))
      .catch((e) => setError(String(e)))
    initPreloadStrategy()
  }, [])

  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">Database init failed: {error}</div>
  }

  if (!ready) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
