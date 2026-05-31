/**
 * nuxt generate → .output/public/ → public/
 * Server (Apache/Nginx) serves from public/.
 */
const { cpSync, rmSync, mkdirSync, existsSync } = require('fs')
const { join } = require('path')

const src  = join(__dirname, '..', '.output', 'public')
const dest = join(__dirname, '..', 'public')

if (!existsSync(src)) {
  console.error('ERROR: .output/public/ not found. Run nuxt generate first.')
  process.exit(1)
}

// Keep only config.js and .htaccess, remove old build artifacts
const keep = new Set(['.htaccess', 'config.js'])
const { readdirSync } = require('fs')

for (const entry of readdirSync(dest)) {
  if (!keep.has(entry)) {
    rmSync(join(dest, entry), { recursive: true, force: true })
  }
}

// Copy generated output to public/
cpSync(src, dest, { recursive: true, force: true })

console.log('✓ .output/public/ → public/ copied successfully')
