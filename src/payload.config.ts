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
// Read via process.env object so Next does not freeze an empty build-time value.
const runtimeEnv = process.env
const blobToken = runtimeEnv.BLOB_READ_WRITE_TOKEN
const connectionString =
  runtimeEnv.POSTGRES_URL || runtimeEnv.DATABASE_URL || ''
const serverURL = runtimeEnv.NEXT_PUBLIC_SERVER_URL || undefined

if (!runtimeEnv.PAYLOAD_SECRET) {
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
  serverURL,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname)
    }
  },
  collections: [Users, Media, Posts, Pages, Categories, Tags],
  editor: lexicalEditor(),
  secret: runtimeEnv.PAYLOAD_SECRET || 'INSECURE_MISSING_PAYLOAD_SECRET',
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
