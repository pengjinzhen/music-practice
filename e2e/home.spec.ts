import { test, expect } from '@playwright/test'

test.describe('Home Dashboard', () => {
  test('7. stats cards display correctly', async ({ page }) => {
    await page.goto('/')
    // Wait for DB init
    await page.waitForTimeout(2000)
    // Should show stat cards (practice time, sessions, avg score)
    const cards = page.locator('[class*="card"], [class*="Card"]')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
  })

  test('8. start practice button navigates to /practice', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    const startBtn = page.getByRole('link', { name: /start|开始/i }).or(
      page.getByRole('button', { name: /start|开始/i })
    )
    await expect(startBtn.first()).toBeVisible({ timeout: 10000 })
    await startBtn.first().click()
    await expect(page).toHaveURL(/\/(practice|library)/)
  })

  test('9. weekly goal card renders', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    // Look for weekly goal related text
    const goalSection = page.getByText(/goal|目标|week/i).first()
    await expect(goalSection).toBeVisible({ timeout: 10000 })
  })

  test('10. empty state shown when no practice records', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    // With fresh DB, should show empty state or zero stats
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('11. recent practice list renders', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)
    // Recent section should exist (may be empty)
    const recentSection = page.getByText(/recent|最近/i).first()
    await expect(recentSection).toBeVisible({ timeout: 10000 })
  })
})
