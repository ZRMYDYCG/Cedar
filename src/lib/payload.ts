import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { cache } from 'react'

const INIT_TIMEOUT_MS = 30_000

/** Process-wide singleton — React `cache()` only dedupes within one request. */
let payloadPromise: Promise<Payload> | null = null

function initPayload(): Promise<Payload> {
  if (!payloadPromise) {
    payloadPromise = getPayload({ config }).catch((err) => {
      payloadPromise = null
      throw err
    })
  }
  return payloadPromise
}

export const getPayloadClient = cache(async (): Promise<Payload> => {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    throw new Error(
      'Missing POSTGRES_URL (or DATABASE_URL). Add it in Vercel → Settings → Environment Variables.'
    )
  }

  const init = initPayload()
  let timer: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      init,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(
            new Error(
              `Payload init timed out after ${INIT_TIMEOUT_MS}ms (check Postgres connectivity / migrations)`
            )
          )
        }, INIT_TIMEOUT_MS)
      })
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
})
