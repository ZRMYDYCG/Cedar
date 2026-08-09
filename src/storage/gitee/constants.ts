/** Hard ceiling for Gitee Contents API (base64 JSON body). */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024

/**
 * Soft target for Vercel → Gitee uploads. Keeping objects small avoids
 * 60s function timeouts (ERR_CONNECTION_CLOSED / Admin `.doc` crash).
 */
export const TARGET_UPLOAD_BYTES = 512 * 1024

/** Reject absurd originals before sharp burns memory. */
export const MAX_INPUT_BYTES = 40 * 1024 * 1024

/** Abort slow Gitee API calls before the platform kills the function. */
export const GITEE_FETCH_TIMEOUT_MS = 25_000
