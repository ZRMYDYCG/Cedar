import { paragraphLexical } from '@/data/cms/map-post'
import { safeCms } from '@/data/cms/safe'
import { getPayloadClient } from '@/lib/payload'
import { decodePathSegment } from '@/lib/path-segment'
import type { Page } from '@/payload-types'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

export type CmsPage = {
  title: string
  slug: string
  html: string
}

export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const normalized = decodePathSegment(slug)
  return safeCms(
    `getPageBySlug:${normalized}`,
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'pages',
        where: {
          and: [
            { _status: { equals: 'published' } },
            { slug: { equals: normalized } }
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
    },
    null
  )
}

/** Used by seed only — re-export helper */
export { paragraphLexical }
