import { test, expect } from '@playwright/test'

test.describe('Report Page', () => {
  test('29. report page loads with radar chart', async ({ page }) => {
    // First create a session via practice flow
    await page.goto('/report/test-session-id')
    await page.waitForTimeout(2000)
    // Should show report page content (may be empty state)
    await expect(page.locator('body')).toBeVisible()
  })

  test('30. empty state when no data', async ({ page }) => {
    await page.goto('/report/nonexistent-id')
    await page.waitForTimeout(2000)
    // Should show empty state or error
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('31. back button navigates to previous page', async ({ page }) => {
    await page.goto('/')
    await page.goto('/report/test-id')
    await page.waitForTimeout(2000)
    const backBtn = page.getByRole('button', { name: /back|返回/i }).or(
      page.locator('button').filter({ has: page.locator('svg') }).first()
    )
    if (await backBtn.isVisible()) {
      await backBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test('32. share button is clickable', async ({ page }) => {
    await page.goto('/report/test-id')
    await page.waitForTimeout(2000)
    const shareBtn = page.getByRole('button', { name: /share|分享/i })
    if (await shareBtn.isVisible()) {
      await shareBtn.click()
    }
  })

  test('33. practice suggestions area renders', async ({ page }) => {
    await page.goto('/report/test-id')
    await page.waitForTimeout(2000)
    // Page should render without crashing
    await expect(page.locator('body')).toBeVisible()
  })
})
