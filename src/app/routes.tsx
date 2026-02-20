import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'

const HomePage = lazy(() => import('@/pages/HomePage'))
const LibraryPage = lazy(() => import('@/pages/LibraryPage'))
const PracticePage = lazy(() => import('@/pages/PracticePage'))
const ReportPage = lazy(() => import('@/pages/ReportPage'))
const SectionPracticePage = lazy(() => import('@/pages/SectionPracticePage'))
const TunerPage = lazy(() => import('@/pages/TunerPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const ShareReportPage = lazy(() => import('@/pages/ShareReportPage'))

export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/library', element: <LibraryPage /> },
      { path: '/practice', element: <PracticePage /> },
      { path: '/report/:id', element: <ReportPage /> },
      { path: '/practice/section', element: <SectionPracticePage /> },
      { path: '/tuner', element: <TunerPage /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
  { path: '/share/:token', element: <ShareReportPage /> },
]
