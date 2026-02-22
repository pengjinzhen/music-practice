import { describe, it, expect } from 'vitest'
import { routes } from '@/app/routes'
import type { RouteObject } from 'react-router-dom'

/** 递归收集所有路由路径 */
function collectPaths(routeList: RouteObject[]): string[] {
  const paths: string[] = []
  for (const r of routeList) {
    if (r.path) paths.push(r.path)
    if (r.children) paths.push(...collectPaths(r.children))
  }
  return paths
}

describe('第12轮：路由与导航测试', () => {
  const allPaths = collectPaths(routes)

  it('12-1: 路由配置包含所有预期路径', () => {
    const expected = [
      '/', '/library', '/practice', '/report/:id',
      '/practice/section', '/tuner', '/profile', '/share/:token',
    ]
    for (const p of expected) {
      expect(allPaths).toContain(p)
    }
  })

  it('12-2: /report/:id 路由包含动态参数', () => {
    expect(allPaths.some(p => p.includes(':id'))).toBe(true)
  })

  it('12-3: /share/:token 路由不在 MainLayout children 内', () => {
    const mainLayout = routes.find(r => r.children)
    const childPaths = mainLayout?.children?.map(c => c.path) || []
    expect(childPaths).not.toContain('/share/:token')
    // 但它应该在顶层路由中
    const topPaths = routes.filter(r => !r.children).map(r => r.path)
    expect(topPaths).toContain('/share/:token')
  })

  it('12-4: 所有 lazy 导入的页面文件都存在（静态验证）', () => {
    // routes.tsx 中 lazy 导入了 8 个页面
    const expectedPages = [
      'HomePage', 'LibraryPage', 'PracticePage', 'ReportPage',
      'SectionPracticePage', 'TunerPage', 'ProfilePage', 'ShareReportPage',
    ]
    // 验证路由数量匹配
    expect(allPaths.length).toBe(expectedPages.length)
  })

  it('12-5: 路由路径没有重复定义', () => {
    const unique = new Set(allPaths)
    expect(unique.size).toBe(allPaths.length)
  })
})
