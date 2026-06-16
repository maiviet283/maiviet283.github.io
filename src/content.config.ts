import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

// Blog posts live as Markdown files in src/content/blog/*.md
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().default('/avatar.jpg'),
    heroImageAlt: z.string().default('Mai Quốc Việt'),
    tags: z.array(z.string()).default([]),
    keywords: z.string().optional(),
    // Pinned ordering: posts with a lower `order` appear first; the rest
    // fall back to newest-pubDate-first.
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog }
