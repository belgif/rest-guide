/**
 * Minimal HTTP server for local preview of build/site.
 * Usage: node scripts/serve.js  (or: npm run serve)
 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const SITE_DIR = path.join(__dirname, '..', 'build', 'site')
const PORT = process.env.PORT || 4000

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  // pagefind-specific
  '.pf_meta': 'application/octet-stream',
  '.pagefind': 'application/octet-stream',
  '.wasm': 'application/wasm',
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0]
  let filePath = path.join(SITE_DIR, urlPath)

  // If directory, try index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html')
  }

  if (!fs.existsSync(filePath)) {
    const notFound = path.join(SITE_DIR, '404.html')
    if (fs.existsSync(notFound)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      fs.createReadStream(notFound).pipe(res)
    } else {
      res.writeHead(404)
      res.end('Not found')
    }
    return
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME[ext] || 'application/octet-stream'
  res.writeHead(200, { 'Content-Type': contentType })
  fs.createReadStream(filePath).pipe(res)
})

server.listen(PORT, () => {
  console.log(`Serving build/site at http://localhost:${PORT}`)
  console.log('Press Ctrl+C to stop.')
})

