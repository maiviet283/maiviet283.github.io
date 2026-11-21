import type { APIRoute } from 'astro'
import { lastModified, w3cDate } from '../lib/lastmod'

const SITE = 'https://maiviet.vietdon.vn'

/**
 * Chỉ trang chủ có bản song ngữ, nên chỉ cặp này khai hreflang. Khai alternate
 * cho một trang không có bản dịch là tín hiệu sai và Google sẽ bỏ qua cả cụm.
 */
const ALTERNATES = [
  { hreflang: 'vi', href: `${SITE}/` },
  { hreflang: 'en', href: `${SITE}/en/` },
  { hreflang: 'x-default', href: `${SITE}/` },
]
const BILINGUAL = new Set(['/', '/en/'])

/**
 * File nguồn quyết định <lastmod> của mỗi route. Trang chủ dựng từ các
 * component + file ngôn ngữ nên phải tính cả chúng, không chỉ file page.
 * Route không khai ở đây sẽ mặc định lấy chính file .astro của nó.
 */
const LAYOUT = ['src/layouts/Layout.astro', 'src/styles/global.css', 'src/components/Header.astro', 'src/components/SiteFooter.astro']
const PAGE = [...LAYOUT, 'src/layouts/PageLayout.astro']

const SOURCES: Record<string, string[]> = {
  '/': ['src/pages/index.astro', 'src/components', 'src/localet/vi.json', ...LAYOUT],
  '/en/': ['src/pages/en/index.astro', 'src/components', 'src/localet/en.json', ...LAYOUT],
  '/about/': ['src/pages/about/index.astro', 'src/localet/vi.json', 'src/components/WorkSection.astro', ...PAGE],
  '/vietdon/': ['src/pages/vietdon/index.astro', ...PAGE],
  '/projects/': ['src/pages/projects/index.astro', 'src/localet/vi.json', 'src/components/ProjectList.astro', 'src/components/ProductFeature.astro', ...PAGE],
}

/** Thứ tự xuất hiện trong sitemap: trang quan trọng trước, phần còn lại A→Z. */
const ORDER = ['/', '/en/', '/about/', '/projects/', '/vietdon/']

/** Trang không đưa vào sitemap (noindex). */
const EXCLUDE = new Set(['/404/'])

interface Entry {
  path: string
  lastmod: Date
}

const escapeXml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char] as string,
  )

/**
 * Tự dò các trang tĩnh thay vì liệt kê tay, để trang mới thêm vào src/pages
 * không bị bỏ quên trong sitemap.
 */
const staticRoutes = (): string[] => {
  // Vite rút gọn key về dạng './about/index.astro' vì file này đã nằm trong
  // src/pages, nên phải cắt cả hai dạng tiền tố.
  const files = Object.keys(import.meta.glob('./**/*.astro'))

  return files
    .map((file) => file.replace(/^\.\.\/pages/, '').replace(/^\./, '').replace(/\.astro$/, ''))
    // Bỏ route động ([...slug]).
    .filter((route) => !/[[\]]/.test(route))
    // Bỏ file private (_component.astro) — Astro không build thành trang.
    .filter((route) => !route.split('/').some((segment) => segment.startsWith('_')))
    .map((route) => {
      const clean = route.replace(/\/index$/, '/')
      return clean === '' ? '/' : clean.endsWith('/') ? clean : `${clean}/`
    })
    .filter((route) => !EXCLUDE.has(route))
}

export const GET: APIRoute = async () => {
  const entries: Entry[] = staticRoutes()
    .map((path) => ({
      path,
      lastmod: lastModified(SOURCES[path] ?? [`src/pages${path === '/' ? '/index' : `${path}index`}.astro`]),
    }))
    .sort((a, b) => {
      const ia = ORDER.indexOf(a.path)
      const ib = ORDER.indexOf(b.path)
      if (ia !== ib) return (ia < 0 ? ORDER.length : ia) - (ib < 0 ? ORDER.length : ib)
      return a.path.localeCompare(b.path)
    })

  const urls = entries
    .map((entry) => {
      const alternates = BILINGUAL.has(entry.path)
        ? ALTERNATES.map(
            (alt) =>
              `\n    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXml(alt.href)}" />`,
          ).join('')
        : ''

      return `  <url>
    <loc>${escapeXml(`${SITE}${entry.path}`)}</loc>
    <lastmod>${w3cDate(entry.lastmod)}</lastmod>${alternates}
  </url>`
    })
    .join('\n')

  // Cố ý bỏ <changefreq> và <priority>: Google và Bing đều đã công khai bỏ qua
  // hai thẻ này, giữ lại chỉ làm file nặng thêm mà không đổi được gì.
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
