// @ts-check
const { test, expect } = require('@playwright/test')
const fs = require('fs')
const path = require('path')

function loadHtml (relativePath) {
  return fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8')
}

test('Rule block title is rendered as h6 with the rule id and data-pagefind-weight', async () => {
  const html = loadHtml('build/site/api-guide/resources-collection.html')
  expect(html).toContain('<h6 id="rule-col-name" class="title" data-pagefind-weight="10">')
  // Rule block outer div no longer carries the rule id
  expect(html).not.toContain('<div id="rule-col-name"')
})

test('Generated HTML contains no hidden rule-search-keyword span', async () => {
  const html = loadHtml('build/site/api-guide/resources-collection.html')
  expect(html).not.toContain('rule-search-keyword')
})
