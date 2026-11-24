// @ts-check
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:4000',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx serve ./build/site -l 4000 -c ../../serve.json',
    port: 4000, // used to check server is running already; didn't work with 'url' alternative - possibly https://github.com/microsoft/playwright/issues/8513
    reuseExistingServer: !process.env.CI,
  },
})

