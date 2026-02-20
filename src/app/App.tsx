import { Suspense, useEffect } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { routes } from './routes'
import { initPreloadStrategy } from '@/utils/preload'

function AppRoutes() {
  const element = useRoutes(routes)
  return <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>{element}</Suspense>
}

export default function App() {
  useEffect(() => { initPreloadStrategy() }, [])
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
