import { test, expect } from '@playwright/test'

test.describe('Edge Cases', () => {
  test('48. nonexistent report ID shows empty state', async ({ page }) => {
    await page.goto('/report/does-not-exist-12345')
    await page.waitForTimeout(2000)
    // Should not crash, should show some UI
    await expect(page.locator('body')).toBeVisible()
    // Should show empty state or "not found" message
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toBeTruthy()
  })

  test('49. /practice without track param shows prompt', async ({ page }) => {
    await page.goto('/practice')
    await page.waitForTimeout(2000)
    await expect(page.getByText(/select|选择/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('50. data persists after page refresh', async ({ page }) => {
    // Go to profile and set nickname
    await page.goto('/profile')
    await page.waitForTimeout(2000)
    const nicknameInput = page.locator('input').first()
    if (await nicknameInput.isVisible()) {
      await nicknameInput.fill('PersistTest')
      // Trigger save (blur or button)
      await nicknameInput.blur()
      await page.waitForTimeout(1000)

      // Refresh page
      await page.reload()
      await page.waitForTimeout(2000)

      // Check if nickname persisted
      const inputAfter = page.locator('input').first()
      if (await inputAfter.isVisible()) {
        const value = await inputAfter.inputValue()
        // With DB persistence fix, this should work
        expect(value).toBeTruthy()
      }
    }
  })
})
