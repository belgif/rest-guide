/**
 * Serve the generated static site from build/site.
 * Usage: node scripts/serve.js  (or: npm run serve)
 */
const { spawn } = require('child_process')
const path = require('path')
const SITE_DIR = path.join(__dirname, '..', 'build', 'site')
const PORT = String(process.env.PORT || 4000)
const httpServerBin = require.resolve('http-server/bin/http-server')
const args = [SITE_DIR, '-p', PORT, '-c-1']
const child = spawn(process.execPath, [httpServerBin, ...args], {
  stdio: 'inherit',
  env: process.env,
})
const stop = signal => {
  if (!child.killed) {
    child.kill(signal)
  }
}
process.on('SIGINT', () => stop('SIGINT'))
process.on('SIGTERM', () => stop('SIGTERM'))
child.on('error', error => {
  console.error(error)
  process.exit(1)
})
child.on('exit', code => {
  process.exit(code ?? 0)
})