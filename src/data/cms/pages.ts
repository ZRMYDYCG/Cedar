import { paragraphLexical } from '@/data/cms/map-post'
import { getPayloadClient } from '@/lib/payload'
import type { Page } from '@/payload-types'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

export type CmsPage = {
  title: string
  slug: string
  html: string
}

export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { slug: { equals: slug } }
      ]
    },
    limit: 1,
    depth: 0
  })
  const page = result.docs[0] as Page | undefined
  if (!page) return null
  return {
    title: page.title,
    slug: page.slug,
    html: convertLexicalToHTML({ data: page.content })
  }
}

/** Used by seed only — re-export helper */
export { paragraphLexical }
