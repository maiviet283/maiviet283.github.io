/** Thông tin dùng chung cho SEO và JSON-LD trên toàn site. */

export const SITE = 'https://maiviet283.github.io'

export const SAME_AS = [
  'https://github.com/maiviet283',
  'https://www.facebook.com/maiviet283',
  'https://www.linkedin.com/in/maiviet283/',
  'https://www.tiktok.com/@maiviet283',
  'https://www.instagram.com/maiviet283',
]

const AVATAR = {
  '@type': 'ImageObject',
  url: `${SITE}/avatar.jpg`,
  width: 800,
  height: 800,
  caption: 'Mai Quốc Việt – Full-stack Developer tại Đà Nẵng',
}

const BNH = { '@type': 'Organization', name: 'BNH Digital', url: 'https://www.bnh-digital.com/' }

const VKU = {
  '@type': 'CollegeOrUniversity',
  name: 'VKU – Trường Đại học Công nghệ Thông tin và Truyền thông Việt – Hàn',
  alternateName: [
    'VKU',
    'Trường Việt Hàn',
    'Vietnam-Korea University of Information and Communication Technology',
  ],
  sameAs: 'https://vku.udn.vn/',
}

const IDENTIFIERS = [
  { '@type': 'PropertyValue', name: 'Mã sinh viên VKU', value: '21IT595' },
  { '@type': 'PropertyValue', name: 'Lớp', value: '21NS' },
]

export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Mai Quốc Việt',
  alternateName: ['Mai Quoc Viet', 'maiviet283'],
  url: SITE,
  mainEntityOfPage: SITE,
  image: AVATAR,
  jobTitle: 'Full-stack Developer & Team Lead',
  description:
    'Full-stack developer & team lead tại Đà Nẵng: dẫn team tại BNH Digital, co-founder Haven, từng xây VietDon.',
  worksFor: BNH,
  alumniOf: VKU,
  identifier: IDENTIFIERS,
  nationality: { '@type': 'Country', name: 'Việt Nam' },
  knowsLanguage: ['vi', 'en'],
  address: { '@type': 'PostalAddress', addressLocality: 'Đà Nẵng', addressCountry: 'VN' },
  birthPlace: { '@type': 'Place', name: 'Kỳ Khang, Kỳ Anh, Hà Tĩnh, Việt Nam' },
  homeLocation: { '@type': 'Place', name: 'Đà Nẵng, Việt Nam' },
  email: 'maiviet283@gmail.com',
  sameAs: SAME_AS,
  knowsAbout: [
    'Python', 'Django', 'Django REST Framework', 'FastAPI', 'Celery', 'WebSocket',
    'React', 'TypeScript', 'React Native', 'Tauri', 'Astro',
    'PostgreSQL', 'PgBouncer', 'pgRouting', 'Redis', 'MySQL',
    'Docker', 'Nginx', 'Cloudflare', 'Sentry', 'CI/CD',
    'Multi-tenant SaaS', 'Information Security', 'Full-stack Development',
  ],
}

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mai Quốc Việt – Profile',
  url: SITE,
  description:
    'Trang cá nhân của Mai Quốc Việt (maiviet283) – Full-stack developer & team lead từ Đà Nẵng, co-founder Haven.',
  inLanguage: ['vi', 'en'],
  image: `${SITE}/og-image.png`,
  author: { '@type': 'Person', name: 'Mai Quốc Việt' },
  publisher: {
    '@type': 'Person',
    name: 'Mai Quốc Việt',
    logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` },
  },
  hasPart: [
    { '@type': 'WebPage', name: 'Dự án', url: `${SITE}/projects/` },
    { '@type': 'WebPage', name: 'VietDon (lưu trữ)', url: `${SITE}/vietdon/` },
    { '@type': 'WebPage', name: 'Giới thiệu', url: `${SITE}/about/` },
  ],
}

/**
 * Đánh dấu trang chủ là ProfilePage có ảnh chính, để Google có avatar rõ
 * ràng gắn với kết quả tìm kiếm.
 */
export const profilePageJsonLd = (url: string, lang: string) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  url,
  inLanguage: lang,
  mainEntity: { '@type': 'Person', name: 'Mai Quốc Việt', url: SITE },
  primaryImageOfPage: AVATAR,
})

export const aboutProfileJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person',
    name: 'Mai Quốc Việt',
    alternateName: ['Mai Quoc Viet', 'maiviet283'],
    url: `${SITE}/`,
    image: `${SITE}/avatar.jpg`,
    jobTitle: 'Full-stack Developer & Team Lead',
    description:
      'Mai Quốc Việt – full-stack developer & team lead tại Đà Nẵng, sinh ra ở Kỳ Khang, Kỳ Anh, Hà Tĩnh. Kỹ sư An toàn thông tin & Mạng máy tính tại VKU (mã sinh viên 21IT595, lớp 21NS), co-founder Haven.',
    birthPlace: { '@type': 'Place', name: 'Kỳ Khang, Kỳ Anh, Hà Tĩnh, Việt Nam' },
    homeLocation: { '@type': 'Place', name: 'Đà Nẵng, Việt Nam' },
    nationality: { '@type': 'Country', name: 'Việt Nam' },
    worksFor: BNH,
    alumniOf: VKU,
    identifier: IDENTIFIERS,
    sameAs: SAME_AS,
    knowsAbout: ['Python', 'Django', 'FastAPI', 'React', 'React Native', 'PostgreSQL', 'Redis', 'Docker', 'Full-stack Development'],
    knowsLanguage: ['vi', 'en'],
  },
}

export const HOME_KEYWORDS =
  'Mai Quốc Việt, Mai Quoc Viet, maiviet283, Mai Quốc Việt Haven, Mai Quốc Việt BNH Digital, full-stack developer Đà Nẵng, VietDon, Mai Quốc Việt Hà Tĩnh, Mai Quốc Việt Kỳ Anh, Mai Quốc Việt Kỳ Khang, Mai Quốc Việt VietDon, Mai Quốc Việt Đà Nẵng, backend developer Đà Nẵng, lập trình viên Đà Nẵng, lập trình Đà Nẵng, Python developer Vietnam, Django developer, FastAPI, React developer Vietnam, team lead Đà Nẵng, profile Mai Quốc Việt'
