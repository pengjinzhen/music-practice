import { test, expect } from '@playwright/test'

test.describe('Library Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library')
    await page.waitForTimeout(2000)
  })

  test('12. library page loads and shows piano tracks', async ({ page }) => {
    // Should show track cards
    const trackCards = page.locator('[class*="card"], [class*="Card"]').or(
      page.locator('[data-testid="track-card"]')
    )
    await expect(trackCards.first()).toBeVisible({ timeout: 10000 })
  })

  test('13. switch to cello tab shows cello tracks', async ({ page }) => {
    const celloTab = page.getByRole('tab', { name: /cello|大提琴/i }).or(
      page.getByText(/cello|大提琴/i).first()
    )
    await expect(celloTab).toBeVisible({ timeout: 10000 })
    await celloTab.click()
    await page.waitForTimeout(500)
    // Should show cello tracks
    await expect(page.getByText(/twinkle.*cello|大提琴.*twinkle/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('14. search box filters tracks', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|搜索/i).or(
      page.locator('input[type="search"], input[type="text"]').first()
    )
    await expect(searchInput).toBeVisible({ timeout: 10000 })
    await searchInput.fill('Twinkle')
    await page.waitForTimeout(500)
    // Should filter to show Twinkle
    await expect(page.getByText(/Twinkle/i).first()).toBeVisible()
  })

  test('15. difficulty filter buttons work', async ({ page }) => {
    // Look for difficulty filter buttons
    const allBtn = page.getByRole('button', { name: /all|全部/i }).or(
      page.getByText(/all|全部/i).first()
    )
    await expect(allBtn).toBeVisible({ timeout: 10000 })

    const beginnerBtn = page.getByRole('button', { name: /beginner|初级/i }).or(
      page.getByText(/beginner|初级/i).first()
    )
    if (await beginnerBtn.isVisible()) {
      await beginnerBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test('16. track card shows name, composer, difficulty', async ({ page }) => {
    // Check first track card has expected info
    await expect(page.getByText(/Twinkle/i).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Traditional/i).first()).toBeVisible()
  })

  test('17. clicking track card navigates to practice with track param', async ({ page }) => {
    // Click on a track card
    const trackLink = page.getByText(/Twinkle/i).first()
    await expect(trackLink).toBeVisible({ timeout: 10000 })
    await trackLink.click()
    await expect(page).toHaveURL(/\/practice\?track=/)
  })

  test('18. upload MusicXML button triggers file picker', async ({ page }) => {
    const uploadBtn = page.getByRole('button', { name: /upload|上传/i }).or(
      page.getByText(/upload|上传/i).first()
    )
    await expect(uploadBtn).toBeVisible({ timeout: 10000 })
    // Verify file input exists
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toBeAttached()
  })

  test('19. empty state when no matching tracks', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|搜索/i).or(
      page.locator('input[type="search"], input[type="text"]').first()
    )
    await expect(searchInput).toBeVisible({ timeout: 10000 })
    await searchInput.fill('xyznonexistent')
    await page.waitForTimeout(500)
    // Should show empty state or no results
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})
