// @ts-check
const { test, expect } = require('@playwright/test')

test('Redirection for section header', async ({ page }) => {
  await page.goto('/api-guide/#pagination')
  await expect(page).toHaveURL('/api-guide/resources-collection.html#pagination')
})

test('Redirection for rule anchor', async ({ page }) => {
  await page.goto('/api-guide/#rule-prf-embed')
  await expect(page).toHaveURL('/api-guide/performance.html#rule-prf-embed')
})