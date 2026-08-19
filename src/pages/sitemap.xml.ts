import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { gitCommitDate, lastModified, w3cDate } from '../lib/lastmod'

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
const SOURCES: Record<string, string[]> = {
  '/': [
    'src/pages/index.astro',
    'src/components',
    'src/localet/vi.json',
    'src/layouts/Layout.astro',
  ],
  '/en/': [
    'src/pages/en/index.astro',
    'src/components',
    'src/localet/en.json',
    'src/layouts/Layout.astro',
  ],
  '/about/': ['src/pages/about/index.astro', 'src/layouts/PageLayout.astro'],
  '/vietdon/': ['src/pages/vietdon/index.astro', 'src/layouts/PageLayout.astro'],
  '/projects/': ['src/pages/projects/index.astro', 'src/layouts/PageLayout.astro'],
  '/blog/': ['src/pages/blog/index.astro', 'src/layouts/PageLayout.astro'],
}

/** Thứ tự xuất hiện trong sitemap: trang quan trọng trước, phần còn lại A→Z. */
const ORDER = ['/', '/en/', '/about/', '/vietdon/', '/projects/', '/blog/']

interface Entry {
  path: string
  lastmod: Date
}

/**
 * Ngưỡng cảnh báo "frontmatter đã cũ". Đặt rộng tay vì các đợt sửa gộp
 * (đổi layout, chỉnh SEO) cũng chạm vào file .md mà không đổi nội dung bài;
 * chỉ khoảng lệch lớn mới đáng nghi là bài đã viết lại mà quên updatedDate.
 */
const STALE_AFTER = 30 * 24 * 60 * 60 * 1000

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
    // Bỏ route động ([...slug]) — chúng được liệt kê riêng từ content collection.
    .filter((route) => !/[[\]]/.test(route))
    // Bỏ file private (_component.astro) — Astro không build thành trang.
    .filter((route) => !route.split('/').some((segment) => segment.startsWith('_')))
    .map((route) => {
      const clean = route.replace(/\/index$/, '/')
      return clean === '' ? '/' : clean.endsWith('/') ? clean : `${clean}/`
    })
}

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft)

  const postEntries: Entry[] = posts
    .map((post) => {
      const declared = post.data.updatedDate ?? post.data.pubDate
      const file = `src/content/blog/${post.id}.md`
      const committed = gitCommitDate(file)

      // Bài viết lấy ngày từ frontmatter chứ không từ git, để <lastmod> luôn
      // khớp dateModified của BlogPosting JSON-LD trên chính trang đó — hai
      // con số vênh nhau là tín hiệu mâu thuẫn gửi cho Google.
      if (committed && committed.valueOf() - declared.valueOf() > STALE_AFTER) {
        console.warn(
          `[sitemap] ${file} đã sửa ${committed.toISOString().slice(0, 10)} ` +
            `nhưng frontmatter vẫn ghi ${declared.toISOString().slice(0, 10)} — ` +
            'cập nhật updatedDate để lastmod phản ánh đúng.',
        )
      }

      return { path: `/blog/${post.id}/`, lastmod: declared }
    })
    .sort((a, b) => b.lastmod.valueOf() - a.lastmod.valueOf())

  // Trang danh sách blog đổi mỗi khi có bài mới, kể cả khi file page không đổi.
  const newestPost = postEntries[0]?.lastmod

  const staticEntries: Entry[] = staticRoutes()
    .map((path) => ({
      path,
      lastmod: lastModified(
        SOURCES[path] ?? [`src/pages${path === '/' ? '/index' : `${path}index`}.astro`],
        path === '/blog/' && newestPost ? [newestPost] : [],
      ),
    }))
    .sort((a, b) => {
      const ia = ORDER.indexOf(a.path)
      const ib = ORDER.indexOf(b.path)
      if (ia !== ib) return (ia < 0 ? ORDER.length : ia) - (ib < 0 ? ORDER.length : ib)
      return a.path.localeCompare(b.path)
    })

  const entries = [...staticEntries, ...postEntries]

  const duplicates = entries
    .map((entry) => entry.path)
    .filter((path, index, all) => all.indexOf(path) !== index)
  if (duplicates.length > 0) {
    console.warn(`[sitemap] URL bị lặp: ${duplicates.join(', ')}`)
  }

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
