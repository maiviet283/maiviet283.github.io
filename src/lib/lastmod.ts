import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Ngày sửa đổi thật của từng file, lấy từ lịch sử git lúc build.
 *
 * Google chỉ tin <lastmod> khi nó chính xác: nếu sitemap khai mọi trang đều
 * "vừa sửa hôm nay" sau mỗi lần deploy, Googlebot sẽ bỏ qua lastmod của toàn
 * bộ site. Vì vậy ngày ở đây lấy từ commit cuối cùng chạm vào file nguồn của
 * trang, không phải thời điểm build.
 */

/** Thư mục gốc dự án (file này nằm ở src/lib/). */
const ROOT = fileURLToPath(new URL('../../', import.meta.url))

const BUILD_TIME = new Date()
const gitCache = new Map<string, Date | null>()

const git = (args: string[]): string | null => {
  try {
    const out = execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    return out === '' ? null : out
  } catch {
    return null
  }
}

/**
 * Trong shallow clone (mặc định của actions/checkout) `git log` chỉ thấy một
 * commit, nên mọi file sẽ mang cùng một ngày — đúng kiểu lastmod rác mà ta
 * đang tránh. Cảnh báo một lần để lỗi này không đi âm thầm vào production.
 */
let checkedShallow = false
const warnIfShallow = () => {
  if (checkedShallow) return
  checkedShallow = true

  if (git(['rev-parse', '--is-shallow-repository']) === 'true') {
    console.warn(
      '[sitemap] Repo đang là shallow clone: <lastmod> sẽ không chính xác. ' +
        'Cần checkout với fetch-depth: 0.',
    )
  }
}

/**
 * Ngày commit cuối cùng chạm vào `path` (file hoặc thư mục), hoặc null khi
 * không có git / file chưa từng được commit.
 */
export const gitCommitDate = (path: string): Date | null => {
  const cached = gitCache.get(path)
  if (cached !== undefined) return cached

  warnIfShallow()

  const iso = git(['log', '-1', '--format=%cI', '--', path])
  const date = iso ? new Date(iso) : null
  const valid = date && !Number.isNaN(date.valueOf()) ? date : null

  gitCache.set(path, valid)
  return valid
}

/**
 * Ngày của một file nguồn: ưu tiên git, lùi về mtime khi file chưa commit.
 *
 * mtime chỉ là phương án chót vì trên CI nó luôn bằng thời điểm checkout —
 * dùng nó cho mọi file sẽ tái tạo đúng cái lastmod rác ta muốn tránh.
 */
const sourceDate = (path: string): Date | null => {
  const committed = gitCommitDate(path)
  if (committed) return committed

  try {
    return statSync(join(ROOT, path)).mtime
  } catch {
    return null
  }
}

/**
 * Ngày mới nhất trong số các file nguồn của một trang, gộp thêm `extra` (ví dụ
 * updatedDate khai trong frontmatter). Không có dữ liệu nào thì lùi về giờ build.
 */
export const lastModified = (paths: string[], extra: Date[] = []): Date => {
  const dates = [...paths.map(sourceDate), ...extra].filter(
    (d): d is Date => d instanceof Date && !Number.isNaN(d.valueOf()),
  )

  if (dates.length === 0) return BUILD_TIME

  return new Date(Math.max(...dates.map((d) => d.valueOf())))
}

/** W3C datetime cho <lastmod>, bỏ phần mili giây cho gọn. */
export const w3cDate = (date: Date): string => date.toISOString().replace(/\.\d{3}Z$/, 'Z')
