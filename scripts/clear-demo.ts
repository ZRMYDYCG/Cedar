import config from '@payload-config'
import { getPayload } from 'payload'

const collections = ['posts', 'pages', 'categories', 'tags'] as const

export async function clearDemo() {
  const payload = await getPayload({ config })

  for (const collection of collections) {
    const result = await payload.find({
      collection,
      limit: 500,
      depth: 0,
      overrideAccess: true
    })
    for (const doc of result.docs) {
      await payload.delete({
        collection,
        id: doc.id,
        overrideAccess: true
      })
    }
    console.log(`cleared ${collection}: ${result.docs.length}`)
  }

  console.log('\nDemo CMS content removed. Create real posts in /admin.')
}

await clearDemo()
process.exit(0)
