const fs = require('fs')
const path = require('path')
const yazl = require('yazl')

const siteDir = path.resolve(process.cwd(), 'build/site')
const archivePath = path.resolve(process.cwd(), 'build/site.zip')
const temporaryArchivePath = `${archivePath}.tmp-${process.pid}`

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const filePath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkFiles(filePath))
    } else if (entry.isFile()) {
      files.push(filePath)
    }
  }

  return files.sort((left, right) => left.localeCompare(right))
}

function createArchive() {
  if (!fs.existsSync(siteDir)) {
    throw new Error(`Site directory not found: ${siteDir}`)
  }

  fs.mkdirSync(path.dirname(archivePath), { recursive: true })
  fs.rmSync(temporaryArchivePath, { force: true })

  return new Promise((resolve, reject) => {
    const zipFile = new yazl.ZipFile()
    const output = fs.createWriteStream(temporaryArchivePath)
    let settled = false

    const fail = (error) => {
      if (!settled) {
        settled = true
        output.destroy()
        fs.rmSync(temporaryArchivePath, { force: true })
        reject(error)
      }
    }

    zipFile.on('error', fail)
    output.on('error', fail)
    output.on('close', () => {
      if (settled) return
      try {
        fs.renameSync(temporaryArchivePath, archivePath)
        settled = true
        console.log(`Created ${archivePath}`)
        resolve()
      } catch (error) {
        fail(error)
      }
    })

    for (const filePath of walkFiles(siteDir)) {
      zipFile.addFile(filePath, path.relative(siteDir, filePath).split(path.sep).join('/'))
    }

    zipFile.outputStream.pipe(output)
    zipFile.end()
  })
}

createArchive().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})

