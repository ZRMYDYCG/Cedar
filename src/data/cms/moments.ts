import { siteConfig } from '@/config/site-config'
import { safeCms } from '@/data/cms/safe'
import { getResolvedSiteConfig } from '@/data/cms/site-settings'
import { getPayloadClient } from '@/lib/payload'
import type { Media, Moment } from '@/payload-types'

export type MomentImage = {
  id: string | number
  url: string
  alt?: string
  width?: number | null
  height?: number | null
}

export type MomentCard = {
  id: number
  content: string
  location?: string | null
  publishedAt?: string | null
  images: MomentImage[]
  author: {
    name: string
    avatar: string
  }
}

function mediaUrl(media: number | Media | null | undefined): MomentImage | null {
  if (!media || typeof media === 'number') return null
  if (!media.url) return null
  return {
    id: media.id,
    url: media.url,
    alt: media.alt,
    width: media.width,
    height: media.height
  }
}

export function mapMoment(
  doc: Moment,
  site: (typeof siteConfig)['site'] = siteConfig.site
): MomentCard {
  const images = (doc.images || [])
    .map(row => mediaUrl(row?.image))
    .filter((img): img is MomentImage => Boolean(img))
    .slice(0, 9)

  return {
    id: doc.id,
    content: doc.content || '',
    location: doc.location,
    publishedAt: doc.publishedAt,
    images,
    author: {
      name: site.nick || site.author,
      avatar: site.avatar
    }
  }
}

export async function getPublishedMoments(limit = 50): Promise<MomentCard[]> {
  return safeCms(
    'getPublishedMoments',
    async () => {
      const payload = await getPayloadClient()
      const [result, resolved] = await Promise.all([
        payload.find({
          collection: 'moments',
          where: {
            _status: { equals: 'published' }
          },
          depth: 2,
          limit,
          sort: '-publishedAt',
          draft: false,
          overrideAccess: false
        }),
        getResolvedSiteConfig()
      ])

      return (result.docs as Moment[]).map(doc =>
        mapMoment(doc, resolved.site)
      )
    },
    []
  )
}
