const fs = require('fs')
const path = require('path')

const oldAnchorOverrides = {
  'rest-guidelines': 'introduction.html',
  introduction: 'introduction.html',
  changelog: 'changelog.html',
  'rest-api': 'api.html',
  resources: 'resources.html',
  document: 'resources-document.html',
  collection: 'resources-collection.html',
  controller: 'resources-controller.html',
  'http-methods': 'methods.html',
  'status-codes': 'statuscodes.html',
  'media-types': 'mediatypes.html',
  performance: 'performance.html',
  'json-2': 'json.html',
  'api-specs': 'api_specifications.html',
  'hypermedia-controls': 'hypermedia.html',
  'reserved-words': 'reserved.html',
  'error-handling': 'errorhandling.html',
  versioning: 'versioning.html',
  internationalization: 'internationalization.html',
  tracing: 'tracing.html',
  events: 'events.html',
  health: 'health.html',
  'bad-request': 'problems/badRequest.html',
  'no-access-token': 'problems/noAccessToken.html',
  'invalid-access-token': 'problems/invalidAccessToken.html',
  'expired-access-token': 'problems/expiredAccessToken.html',
  'missing-scope': 'problems/missingScope.html',
  'missing-permission': 'problems/missingPermission.html',
  'resource-not-found': 'problems/resourceNotFound.html',
  payloadTooLargeProblem: 'problems/payloadTooLarge.html',
  'too-many-requests': 'problems/tooManyRequests.html',
  'too-many-failed-requests': 'problems/tooManyFailedRequests.html',
  'internal-server-error': 'problems/internalServerError.html',
  'bad-gateway': 'problems/badGateway.html',
  'service-unavailable': 'problems/serviceUnavailable.html'
}

const silentDuplicateAnchors = new Set(['query-parameters'])

function toPosix(filePath) {
  return filePath.split(path.sep).join('/')
}

function walkHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }
  return files
}

function extractAnchors(html) {
  const articlePattern = /<article class="doc">([\s\S]*?)<\/article>/g
  const idPattern = /\bid="([^"]+)"/g
  const ignoredAnchors = new Set(['preamble', 'footnotes'])
  const anchors = []

  articlePattern.lastIndex = 0
  let articleMatch
  while ((articleMatch = articlePattern.exec(html)) !== null) {
    const sanitized = articleMatch[1]
      .replace(/<pre[\s\S]*?<\/pre>/g, '')
      .replace(/<code[\s\S]*?<\/code>/g, '')

    idPattern.lastIndex = 0
    let idMatch
    while ((idMatch = idPattern.exec(sanitized)) !== null) {
      const anchor = idMatch[1]
      if (!ignoredAnchors.has(anchor) && !anchor.startsWith('_footnote')) {
        anchors.push(anchor)
      }
    }
  }

  return anchors
}

function generateRedirects(siteDirArg) {
  const siteDir = path.resolve(process.cwd(), siteDirArg || 'build/site/api-guide')
  const outputFile = path.join(siteDir, 'index.html')

  if (!fs.existsSync(siteDir)) {
    throw new Error(`Site directory not found: ${siteDir}`)
  }

  const anchorTargets = new Map()

  function setTarget(anchor, target, source, options = {}) {
    const force = Boolean(options.force)
    const silent = Boolean(options.silent)
    const current = anchorTargets.get(anchor)
    if (current && current !== target) {
      if (force) {
        anchorTargets.set(anchor, target)
        return
      }
      if (!silent && !silentDuplicateAnchors.has(anchor)) {
        console.warn(`Duplicate anchor '${anchor}' found while processing ${source}; keeping '${current}' and ignoring '${target}'.`)
      }
      return
    }
    anchorTargets.set(anchor, target)
  }

  for (const filePath of walkHtmlFiles(siteDir)) {
    if (path.basename(filePath) === 'index.html') {
      continue
    }

    const html = fs.readFileSync(filePath, 'utf8')
    const page = toPosix(path.relative(siteDir, filePath))
    for (const anchor of extractAnchors(html)) {
      setTarget(anchor, `${page}#${anchor}`, page)
    }
  }

  for (const [anchor, target] of Object.entries(oldAnchorOverrides)) {
    setTarget(anchor, target, 'old single-page redirect map', { force: true, silent: true })
  }

  const sortedRedirects = Object.fromEntries(
    [...anchorTargets.entries()].sort(([left], [right]) => left.localeCompare(right))
  )

  const redirectPage = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="canonical" href="https://www.belgif.be/specification/rest/api-guide/introduction.html">
<meta name="robots" content="noindex">
<title>Redirect Notice</title>
<script>
(function () {
  var redirects = ${JSON.stringify(sortedRedirects, null, 2)};
  var hash = window.location.hash ? window.location.hash.substring(1) : '';
  if (hash) {
    try {
      hash = decodeURIComponent(hash);
    } catch (e) {
      // Keep the original hash when it cannot be decoded.
    }
  }
  var target = hash && redirects[hash] ? redirects[hash] : 'introduction.html';
  window.location.replace(target);
}());
</script>
<noscript>
  <meta http-equiv="refresh" content="0; url=introduction.html">
</noscript>
</head>
<body>
<h1>Redirect Notice</h1>
<p>The page you requested has moved to <a href="introduction.html">https://www.belgif.be/specification/rest/api-guide/introduction.html</a>.</p>
</body>
</html>
`

  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, redirectPage, 'utf8')
  console.log(`Generated redirect map with ${Object.keys(sortedRedirects).length} anchors at ${outputFile}`)
}

module.exports = {
  generateRedirects
}

if (require.main === module) {
  generateRedirects(process.argv[2])
}

