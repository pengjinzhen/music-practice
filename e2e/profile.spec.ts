import { test, expect } from '@playwright/test'

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile')
    await page.waitForTimeout(2000)
  })

  test('38. profile page renders', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible()
    await expect(page.getByText(/profile|个人/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('39. nickname input is editable', async ({ page }) => {
    const nicknameInput = page.locator('input').first()
    await expect(nicknameInput).toBeVisible({ timeout: 10000 })
    await nicknameInput.fill('TestUser')
    await expect(nicknameInput).toHaveValue('TestUser')
  })

  test('40. skill level toggle works', async ({ page }) => {
    const levelBtn = page.getByText(/beginner|intermediate|advanced|初级|中级|高级/i).first()
    await expect(levelBtn).toBeVisible({ timeout: 10000 })
    await levelBtn.click()
  })

  test('41. instrument preference toggle works', async ({ page }) => {
    const instrumentBtn = page.getByText(/piano|cello|钢琴|大提琴/i).first()
    await expect(instrumentBtn).toBeVisible({ timeout: 10000 })
    await instrumentBtn.click()
  })

  test('42. language switch changes UI text', async ({ page }) => {
    // Click the Chinese language button specifically
    const zhBtn = page.locator('button', { hasText: '中文' })
    await expect(zhBtn).toBeVisible({ timeout: 10000 })
    await zhBtn.click()
    await page.waitForTimeout(1000)
    // After switching to Chinese, profile title should be in Chinese
    await expect(page.getByText(/个人/).first()).toBeVisible({ timeout: 5000 })
    // Switch back to English
    const enBtn = page.locator('button', { hasText: 'English' })
    await enBtn.click()
    await page.waitForTimeout(1000)
    await expect(page.getByText(/Profile/).first()).toBeVisible({ timeout: 5000 })
  })

  test('43. achievement badges list renders', async ({ page }) => {
    const achievementSection = page.getByText(/achievement|成就/i).first()
    await expect(achievementSection).toBeVisible({ timeout: 10000 })
  })

  test('44. export data button is clickable', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|导出/i }).first()
    await expect(exportBtn).toBeVisible({ timeout: 10000 })
    await exportBtn.click()
  })
})
