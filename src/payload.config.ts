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
const blobToken = process.env.BLOB_READ_WRITE_TOKEN
const connectionString =
  process.env.POSTGRES_URL || process.env.DATABASE_URL || ''

if (!process.env.PAYLOAD_SECRET) {
  console.warn(
    '[Cedar] PAYLOAD_SECRET is missing — set it in Vercel Environment Variables'
  )
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname)
    }
  },
  collections: [Users, Media, Posts, Pages, Categories, Tags],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'INSECURE_MISSING_PAYLOAD_SECRET',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  db: vercelPostgresAdapter({
    // Create tables on first production boot when Neon/Postgres is empty.
    prodMigrations: migrations,
    pool: connectionString
      ? {
          connectionString
        }
      : undefined
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(blobToken),
      // Bypass Vercel ~4.5MB function body limit (otherwise large uploads → 413)
      clientUploads: true,
      collections: {
        media: true
      },
      token: blobToken
    })
  ]
})
