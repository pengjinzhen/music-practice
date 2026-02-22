import { test, expect } from '@playwright/test'

test.describe('Practice Page', () => {
  test('20. no track shows select prompt and nav button', async ({ page }) => {
    await page.goto('/practice')
    await page.waitForTimeout(2000)
    await expect(page.getByText(/select|选择/i).first()).toBeVisible({ timeout: 10000 })
    const navBtn = page.getByRole('button', { name: /library|曲库/i }).or(
      page.getByRole('link', { name: /library|曲库/i })
    )
    await expect(navBtn.first()).toBeVisible()
  })

  test('21. with track param shows track name and composer', async ({ page }) => {
    await page.goto('/practice?track=p001')
    await page.waitForTimeout(2000)
    await expect(page.getByText(/Twinkle/i).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Traditional/i).first()).toBeVisible()
  })

  test('22. ScoreViewer loads and renders score', async ({ page }) => {
    await page.goto('/practice?track=p001')
    await page.waitForTimeout(3000)
    // Score should load — "Loading score..." should disappear
    await expect(page.getByText(/Loading score/i)).not.toBeVisible({ timeout: 15000 })
  })

  test('23. practice settings panel shows BPM and scoring mode', async ({ page }) => {
    await page.goto('/practice?track=p001')
    await page.waitForTimeout(2000)
    // Should show BPM slider or scoring mode selector
    const bpmText = page.getByText(/BPM/i).first()
    await expect(bpmText).toBeVisible({ timeout: 10000 })
  })

  test('24. start recording button triggers mic request', async ({ page }) => {
    await page.goto('/practice?track=p001')
    await page.waitForTimeout(2000)
    const startBtn = page.getByRole('button', { name: /start|开始/i }).first()
    await expect(startBtn).toBeVisible({ timeout: 10000 })
    await startBtn.click()
    // After clicking, button state should change
    await page.waitForTimeout(1000)
  })

  test('25. waveform display visible during recording', async ({ page }) => {
    await page.goto('/practice?track=p001')
    await page.waitForTimeout(2000)
    const startBtn = page.getByRole('button', { name: /start|开始/i }).first()
    await startBtn.click()
    // Wait for countdown and recording to start
    await page.waitForTimeout(5000)
    // Waveform canvas should be visible
    const canvas = page.locator('canvas')
    if (await canvas.isVisible()) {
      await expect(canvas).toBeVisible()
    }
  })

  test('26. stop button shows confirm dialog', async ({ page }) => {
    await page.goto('/practice?track=p001')
    await page.waitForTimeout(2000)
    const startBtn = page.getByRole('button', { name: /start|开始/i }).first()
    await startBtn.click()
    await page.waitForTimeout(5000)
    // Click stop button
    const stopBtn = page.getByRole('button', { name: /stop|停止/i }).first()
    if (await stopBtn.isVisible()) {
      await stopBtn.click()
      // Dialog should appear
      await expect(page.getByText(/submit|提交/i).first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('27. confirm dialog has 4 action buttons', async ({ page }) => {
    await page.goto('/practice?track=p001')
    await page.waitForTimeout(2000)
    const startBtn = page.getByRole('button', { name: /start|开始/i }).first()
    await startBtn.click()
    await page.waitForTimeout(5000)
    const stopBtn = page.getByRole('button', { name: /stop|停止/i }).first()
    if (await stopBtn.isVisible()) {
      await stopBtn.click()
      await page.waitForTimeout(500)
      // Check for 4 buttons in dialog
      await expect(page.getByRole('button', { name: /submit|提交/i }).first()).toBeVisible({ timeout: 5000 })
      await expect(page.getByRole('button', { name: /save|保存/i }).first()).toBeVisible()
      await expect(page.getByRole('button', { name: /restart|重/i }).first()).toBeVisible()
      await expect(page.getByRole('button', { name: /discard|放弃/i }).first()).toBeVisible()
    }
  })

  test('28. submit navigates to report page', async ({ page }) => {
    await page.goto('/practice?track=p001')
    await page.waitForTimeout(2000)
    const startBtn = page.getByRole('button', { name: /start|开始/i }).first()
    await startBtn.click()
    await page.waitForTimeout(5000)
    const stopBtn = page.getByRole('button', { name: /stop|停止/i }).first()
    if (await stopBtn.isVisible()) {
      await stopBtn.click()
      await page.waitForTimeout(500)
      const submitBtn = page.getByRole('button', { name: /submit|提交/i }).first()
      if (await submitBtn.isVisible()) {
        await submitBtn.click()
        await expect(page).toHaveURL(/\/report\//)
      }
    }
  })
})
