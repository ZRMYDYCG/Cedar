/**
 * Next.js may pass non-ASCII dynamic route params still percent-encoded
 * (e.g. "%E8%B1%86..." instead of "豆腐"). Decode so CMS lookups match.
 */
export function decodePathSegment(value: string | null | undefined): string {
  if (!value) return ''
  let current = value.trim()
  for (let i = 0; i < 3; i++) {
    if (!/%[0-9A-Fa-f]{2}/.test(current)) break
    try {
      const next = decodeURIComponent(current)
      if (next === current) break
      current = next
    } catch {
      break
    }
  }
  return current
}

/** Build a single path segment for href / router.push (encode once). */
export function encodePathSegment(value: string | null | undefined): string {
  const decoded = decodePathSegment(value)
  return decoded ? encodeURIComponent(decoded) : ''
}
