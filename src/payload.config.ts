import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { migrations } from './migrations'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Avoid Next build-time inlining of empty env values (breaks Vercel runtime). */
function env(name: string): string | undefined {
  const value = process.env[name]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

const blobToken = env('BLOB_READ_WRITE_TOKEN')
const connectionString = env('POSTGRES_URL') || env('DATABASE_URL') || ''

if (!env('PAYLOAD_SECRET')) {
  console.warn(
    '[Cedar] PAYLOAD_SECRET is missing — set it in Vercel Environment Variables'
  )
}

if (!blobToken) {
  console.warn(
    '[Cedar] BLOB_READ_WRITE_TOKEN missing — media uploads will hit Vercel 4.5MB limit (413)'
  )
} else {
  console.info('[Cedar] Vercel Blob clientUploads enabled')
}

export default buildConfig({
  // Do not set serverURL from NEXT_PUBLIC_SERVER_URL — a trailing slash / wrong
  // host breaks Admin create routes. Relative /api paths work on Vercel.
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname)
    }
  },
  collections: [Users, Media, Posts, Pages, Categories, Tags],
  editor: lexicalEditor(),
  secret: env('PAYLOAD_SECRET') || 'INSECURE_MISSING_PAYLOAD_SECRET',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  db: vercelPostgresAdapter({
    // Create tables on first production boot when Neon/Postgres is empty.
    prodMigrations: migrations,
    pool: connectionString
      ? {
          connectionString,
          // Fail fast instead of hanging the Vercel function until timeout.
          connectionTimeoutMillis: 8_000,
          max: 5
        }
      : undefined
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      // Bypass Vercel ~4.5MB function body limit (otherwise large uploads → 413)
      clientUploads: true,
      collections: {
        media: true
      },
      enabled: Boolean(blobToken),
      token: blobToken
    })
  ]
})
