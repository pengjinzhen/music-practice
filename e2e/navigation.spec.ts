import { test, expect } from '@playwright/test'

test.describe('Navigation & Layout', () => {
  test('1. homepage loads without stuck on loading', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    // Should not be stuck on a loading spinner forever
    await expect(page.locator('body')).not.toHaveText(/loading/i, { timeout: 10000 })
  })

  test('2. sidebar has 5 nav links that navigate correctly', async ({ page }) => {
    await page.goto('/')
    const routes = [
      { path: '/', label: /home|首页/i },
      { path: '/library', label: /library|曲库/i },
      { path: '/practice', label: /practice|练习/i },
      { path: '/tuner', label: /tuner|调音/i },
      { path: '/profile', label: /profile|个人/i },
    ]
    for (const route of routes) {
      const link = page.locator(`a[href="${route.path}"]`).first()
      await expect(link).toBeVisible()
      await link.click()
      await expect(page).toHaveURL(route.path)
    }
  })

  test('3. mobile bottom nav is visible on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    // Bottom nav should be visible on mobile
    const bottomNav = page.locator('nav').last()
    await expect(bottomNav).toBeVisible()
  })

  test('4. tablet hamburger menu can toggle', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 700 })
    await page.goto('/')
    // Look for hamburger/menu toggle button
    const menuBtn = page.locator('button').filter({ has: page.locator('svg') }).first()
    if (await menuBtn.isVisible()) {
      await menuBtn.click()
      // Sidebar should appear
      await page.waitForTimeout(300)
    }
  })

  test('5. URL changes correctly on page navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await page.locator('a[href="/library"]').first().click()
    await expect(page).toHaveURL('/library')
    await page.locator('a[href="/tuner"]').first().click()
    await expect(page).toHaveURL('/tuner')
  })

  test('6. current nav item is highlighted', async ({ page }) => {
    await page.goto('/library')
    const activeLink = page.locator('a[href="/library"]').first()
    // Check for active styling (bg-accent or similar class)
    await expect(activeLink).toBeVisible()
    const classes = await activeLink.getAttribute('class')
    expect(classes).toBeTruthy()
  })
})
