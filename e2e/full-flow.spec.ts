import { test, expect } from '@playwright/test'

test.describe('Full Flow', () => {
  test('45. library → select track → practice → stop → submit → report', async ({ page }) => {
    await page.goto('/library')
    await page.waitForTimeout(2000)

    // Select a track
    const trackLink = page.getByText(/Twinkle/i).first()
    await expect(trackLink).toBeVisible({ timeout: 10000 })
    await trackLink.click()
    await expect(page).toHaveURL(/\/practice\?track=/)
    await page.waitForTimeout(2000)

    // Verify track loaded
    await expect(page.getByText(/Twinkle/i).first()).toBeVisible()

    // Start recording
    const startBtn = page.getByRole('button', { name: /start|开始/i }).first()
    await startBtn.click()
    await page.waitForTimeout(5000)

    // Stop recording
    const stopBtn = page.getByRole('button', { name: /stop|停止/i }).first()
    if (await stopBtn.isVisible()) {
      await stopBtn.click()
      await page.waitForTimeout(500)

      // Submit
      const submitBtn = page.getByRole('button', { name: /submit|提交/i }).first()
      if (await submitBtn.isVisible()) {
        await submitBtn.click()
        await expect(page).toHaveURL(/\/report\//)
      }
    }
  })

  test('46. home → start practice → select track → practice', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)

    // Click start practice
    const startBtn = page.getByRole('link', { name: /start|开始/i }).or(
      page.getByRole('button', { name: /start|开始/i })
    ).first()
    await startBtn.click()
    await page.waitForTimeout(1000)

    // Should be on practice or library page
    const url = page.url()
    expect(url).toMatch(/\/(practice|library)/)
  })

  test('47. language switch affects all pages', async ({ page }) => {
    // Go to profile and switch language
    await page.goto('/profile')
    await page.waitForTimeout(2000)

    const langBtn = page.getByText(/中文/).first()
    if (await langBtn.isVisible()) {
      await langBtn.click()
      await page.waitForTimeout(500)

      // Navigate to other pages and check Chinese text
      await page.goto('/library')
      await page.waitForTimeout(1000)
      await expect(page.getByText(/曲库|搜索/i).first()).toBeVisible({ timeout: 5000 })

      await page.goto('/tuner')
      await page.waitForTimeout(1000)
      await expect(page.getByText(/调音/i).first()).toBeVisible({ timeout: 5000 })
    }
  })
})
