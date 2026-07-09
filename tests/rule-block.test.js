// @ts-check
const { test, expect } = require('@playwright/test')
const fs = require('fs')
const path = require('path')

test('Rule block title has data-pagefind-weight="10" in generated HTML', async () => {
  const html = fs.readFileSync(
    path.resolve(__dirname, '../build/site/api-guide/resources-collection.html'),
    'utf8'
  )
  expect(html).toContain('<div class="title" data-pagefind-weight="10">Rule:')
})

