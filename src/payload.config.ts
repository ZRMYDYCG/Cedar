import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import {
  BlocksFeature,
  CodeBlock,
  lexicalEditor
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

/** Curated languages for the CMS Code block (Monaco keys). */
const codeBlockLanguages = {
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  shell: 'Shell',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  sql: 'SQL',
  yaml: 'YAML',
  markdown: 'Markdown',
  plaintext: 'Plain Text'
}

import { Categories } from './collections/Categories'
import { Comments } from './collections/Comments'
import { Joys } from './collections/Joys'
import { Media } from './collections/Media'
import { Moments } from './collections/Moments'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { getGiteeConfig, giteeStorage } from './storage/gitee'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Avoid Next build-time inlining of empty env values (breaks Vercel runtime). */
function env(name: string): string | undefined {
  const value = process.env[name]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

const giteeConfig = getGiteeConfig()
const connectionString = env('POSTGRES_URL') || env('DATABASE_URL') || ''

if (!env('PAYLOAD_SECRET')) {
  console.warn(
    '[Cedar] PAYLOAD_SECRET is missing — set it in Vercel Environment Variables'
  )
}

if (!giteeConfig) {
  console.warn(
    '[Cedar] GITEE_OWNER / GITEE_REPO / GITEE_TOKEN missing — media uploads use local disk (not durable on Vercel)'
  )
} else {
  console.info('[Cedar] Gitee media storage enabled')
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
  collections: [
    Users,
    Media,
    Posts,
    Moments,
    Joys,
    Pages,
    Categories,
    Tags,
    Comments
  ],
  globals: [SiteSettings],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      BlocksFeature({
        blocks: [
          CodeBlock({
            slug: 'code',
            defaultLanguage: 'typescript',
            languages: codeBlockLanguages
          })
        ]
      })
    ]
  }),
  secret: env('PAYLOAD_SECRET') || 'INSECURE_MISSING_PAYLOAD_SECRET',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts')
  },
  db: vercelPostgresAdapter({
    // Use migrations only — interactive drizzle "push" hangs Next.js
    // when cloud-storage adds fields like media.prefix.
    push: false,
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
    giteeStorage({
      collections: {
        // Store under media/ in the Gitee repo
        media: { prefix: 'media' }
      },
      enabled: Boolean(giteeConfig)
    })
  ]
})
