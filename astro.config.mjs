import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://maiviet.vietdon.vn',
  markdown: {
    shikiConfig: {
      // Light colours inline, dark colours as CSS vars (switched in global.css).
      themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
    },
  },
})
