/**
 * Generates every icon and the social card from the cartoon mark in
 * src/lib/mascot.mjs. Run after changing the drawing:
 *
 *   node scripts/gen-icons.mjs
 *
 * Outputs into public/: favicon.svg, favicon.ico, favicon-16x16.png,
 * favicon-32x32.png, apple-touch-icon.png, icon-192.png, icon-512.png,
 * logo.png (JSON-LD publisher logo) and og-image.png (1200×630).
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { MASCOT_COLORS, mascotSvg } from '../src/lib/mascot.mjs'

const pub = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url))
const round = Buffer.from(mascotSvg({ id: 'r' }))
const square = Buffer.from(mascotSvg({ id: 's', square: true }))

const png = (svg, size) => sharp(svg, { density: 300 }).resize(size, size).png().toBuffer()

// ICO with embedded PNG frames (supported by every current browser).
const ico = (frames) => {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(frames.length, 4)
  let offset = 6 + frames.length * 16
  const entries = frames.map(({ size, data }) => {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0)
    entry.writeUInt8(size >= 256 ? 0 : size, 1)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(data.length, 8)
    entry.writeUInt32LE(offset, 12)
    offset += data.length
    return entry
  })
  return Buffer.concat([header, ...entries, ...frames.map((f) => f.data)])
}

await writeFile(pub('favicon.svg'), mascotSvg({ id: 'f' }))
await writeFile(pub('favicon-16x16.png'), await png(round, 16))
await writeFile(pub('favicon-32x32.png'), await png(round, 32))
await writeFile(
  pub('favicon.ico'),
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(round, size) })))),
)
await writeFile(pub('apple-touch-icon.png'), await png(square, 180))
await writeFile(pub('icon-192.png'), await png(square, 192))
await writeFile(pub('icon-512.png'), await png(square, 512))
await writeFile(pub('logo.png'), await png(round, 512))

// Social card: paper ground with a dot grid, the mark with a hard offset
// shadow, and the name set large. Text uses Arial (Vietnamese glyphs on every
// machine that runs this script); the site itself uses Barlow Condensed.
const c = MASCOT_COLORS
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="2.2" fill="${c.ink}" fill-opacity=".09"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#f5eee2"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <rect x="0" y="560" width="1200" height="70" fill="${c.ink}"/>
  <circle cx="320" cy="300" r="214" fill="${c.ink}"/>
  <text x="600" y="232" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="30" letter-spacing="5" fill="${c.disc}">MAIVIET283</text>
  <text x="596" y="318" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="64" fill="${c.ink}">MAI QUỐC VIỆT</text>
  <rect x="600" y="346" width="540" height="62" rx="10" fill="#f4b740" stroke="${c.ink}" stroke-width="4"/>
  <text x="620" y="388" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="30" fill="${c.ink}">Full-stack Developer &amp; Team Lead</text>
  <text x="600" y="470" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#4a423b">Python · Django · React · Đà Nẵng</text>
  <text x="60" y="604" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="24" letter-spacing="3" fill="#f5eee2">MAIVIET.VIETDON.VN</text>
</svg>`

const markPng = await sharp(round, { density: 300 }).resize(420, 420).png().toBuffer()
await sharp(Buffer.from(og))
  .composite([{ input: markPng, left: 96, top: 76 }])
  .png()
  .toFile(pub('og-image.png'))

console.log('icons + og-image written to public/')
