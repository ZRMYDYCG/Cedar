/** Swallow CMS/DB errors so the public site can still render empty states. */
export async function safeCms<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.error(`[Cedar CMS] ${label} failed:`, error)
    return fallback
  }
}
