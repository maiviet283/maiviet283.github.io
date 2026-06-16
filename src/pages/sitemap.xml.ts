import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

const SITE = 'https://maiviet.vietdon.vn'

interface Entry {
  loc: string
  lastmod: string
  changefreq: string
  priority: string
  /** Home pages are bilingual and declare hreflang alternates. */
  alternates?: boolean
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().slice(0, 10)

  const posts = await getCollection('blog', ({ data }) => !data.draft)

  const staticEntries: Entry[] = [
    { loc: `${SITE}/`, lastmod: today, changefreq: 'monthly', priority: '1.0', alternates: true },
    { loc: `${SITE}/en/`, lastmod: today, changefreq: 'monthly', priority: '0.9', alternates: true },
    { loc: `${SITE}/about/`, lastmod: today, changefreq: 'monthly', priority: '0.8' },
    { loc: `${SITE}/vietdon/`, lastmod: today, changefreq: 'monthly', priority: '0.8' },
    { loc: `${SITE}/projects/`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
    { loc: `${SITE}/blog/`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
  ]

  const postEntries: Entry[] = posts.map((post) => ({
    loc: `${SITE}/blog/${post.id}/`,
    lastmod: (post.data.updatedDate ?? post.data.pubDate).toISOString().slice(0, 10),
    changefreq: 'monthly',
    priority: '0.7',
  }))

  const entries = [...staticEntries, ...postEntries]

  const altLinks = `
    <xhtml:link rel="alternate" hreflang="vi" href="${SITE}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/" />`

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>${e.alternates ? altLinks : ''}
  </url>`,
  )
  .join('\n')}
</urlset>
`

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
