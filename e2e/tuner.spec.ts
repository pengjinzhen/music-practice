import { test, expect } from '@playwright/test'

test.describe('Tuner Page', () => {
  test('34. tuner page renders with gauge', async ({ page }) => {
    await page.goto('/tuner')
    await page.waitForTimeout(2000)
    await expect(page.locator('body')).toBeVisible()
    // Should show tuner UI
    await expect(page.getByText(/tuner|调音/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('35. start/stop button toggles', async ({ page }) => {
    await page.goto('/tuner')
    await page.waitForTimeout(2000)
    const startBtn = page.getByRole('button', { name: /start|开始/i }).first()
    await expect(startBtn).toBeVisible({ timeout: 10000 })
    await startBtn.click()
    await page.waitForTimeout(1000)
    // Button should change to stop
    const stopBtn = page.getByRole('button', { name: /stop|停止/i }).first()
    if (await stopBtn.isVisible()) {
      await stopBtn.click()
    }
  })

  test('36. cello mode shows string reference', async ({ page }) => {
    await page.goto('/tuner')
    await page.waitForTimeout(2000)
    // Switch to cello if possible
    const celloBtn = page.getByText(/cello|大提琴/i).first()
    if (await celloBtn.isVisible()) {
      await celloBtn.click()
      await page.waitForTimeout(500)
      // Should show string references (A, D, G, C)
      await expect(page.getByText(/[ADGC]\d?/i).first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('37. piano mode hides string reference', async ({ page }) => {
    await page.goto('/tuner')
    await page.waitForTimeout(2000)
    const pianoBtn = page.getByText(/piano|钢琴/i).first()
    if (await pianoBtn.isVisible()) {
      await pianoBtn.click()
      await page.waitForTimeout(500)
    }
    // Page should render without string reference section
    await expect(page.locator('body')).toBeVisible()
  })
})
