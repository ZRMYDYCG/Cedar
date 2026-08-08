import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dir = path.resolve(__dirname, '../src/icons')
const out = path.resolve(__dirname, '../src/components/svg-icon/svg-sprite-data.ts')

const files = fs
  .readdirSync(dir)
  .filter(file => file.endsWith('.svg'))
  .sort()

const names = files.map(file => file.replace(/\.svg$/, ''))

const symbols = files
  .map((file, index) => {
    const name = names[index]
    const raw = fs.readFileSync(path.join(dir, file), 'utf8')
    const viewBox = raw.match(/viewBox=["']([^"']+)["']/)?.[1] || '0 0 24 24'
    const inner = raw
      .replace(/<\?xml[^>]*>/i, '')
      .replace(/<!DOCTYPE[^>]*>/i, '')
      .replace(/<svg[^>]*>/i, '')
      .replace(/<\/svg>/i, '')
      .trim()
    return `  <symbol id="icon-${name}" viewBox="${viewBox}">\n${inner}\n  </symbol>`
  })
  .join('\n')

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">${symbols}\n</svg>`

fs.writeFileSync(
  out,
  [
    '/* Auto-generated from next/src/icons — run: pnpm icons:sprite */',
    `export const SVG_SPRITE = ${JSON.stringify(sprite)}`,
    `export const SVG_ICON_NAMES = ${JSON.stringify(names)} as const`,
    'export type SvgIconName = (typeof SVG_ICON_NAMES)[number]',
    ''
  ].join('\n')
)

console.log(`Generated ${names.length} icons -> ${path.relative(process.cwd(), out)}`)
