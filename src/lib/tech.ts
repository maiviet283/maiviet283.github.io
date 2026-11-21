/**
 * Logos for the stack. Brand marks come from Simple Icons (CC0, read at
 * build time — nothing ships to the browser but the inline path); concepts
 * without a brand mark fall back to one of the site's line icons.
 */
import {
  siAstro,
  siCelery,
  siCloudflare,
  siDjango,
  siDocker,
  siFastapi,
  siGithubactions,
  siJsonwebtokens,
  siMysql,
  siNginx,
  siPostgresql,
  siPython,
  siReact,
  siRedis,
  siSentry,
  siTauri,
  siTypescript,
} from 'simple-icons'
import type { IconName } from '../components/Icon.astro'

export type TechMark = { brand: string } | { line: IconName }

const brand = (icon: { path: string }): TechMark => ({ brand: icon.path })

const MARKS: Record<string, TechMark> = {
  Python: brand(siPython),
  Django: brand(siDjango),
  DRF: brand(siDjango),
  FastAPI: brand(siFastapi),
  Celery: brand(siCelery),
  'Django Channels': { line: 'plug' },
  WebSocket: { line: 'zap' },
  React: brand(siReact),
  TypeScript: brand(siTypescript),
  'React Native': brand(siReact),
  'Tauri v2': brand(siTauri),
  Astro: brand(siAstro),
  PostgreSQL: brand(siPostgresql),
  PgBouncer: brand(siPostgresql),
  pgRouting: { line: 'route' },
  Redis: brand(siRedis),
  MySQL: brand(siMysql),
  Docker: brand(siDocker),
  Nginx: brand(siNginx),
  Cloudflare: brand(siCloudflare),
  Sentry: brand(siSentry),
  'CI/CD': brand(siGithubactions),
  RBAC: { line: 'users' },
  '2FA': { line: 'key' },
  'JWT / OAuth': brand(siJsonwebtokens),
  'Tenant isolation': { line: 'layers' },
  'Audit log': { line: 'list' },
}

export const techMark = (name: string): TechMark => MARKS[name] ?? { line: 'code' }
