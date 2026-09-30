// @ts-check
const { test, expect } = require('@playwright/test')

test('Redirection for section header', async ({ page }) => {
  await page.goto('/#pagination')
  await expect(page).toHaveURL('/resources-collection.html#pagination')
})

test('Redirection for rule anchor', async ({ page }) => {
  await page.goto('/#rule-prf-embed')
  await expect(page).toHaveURL('/performance.html#rule-prf-embed')
})