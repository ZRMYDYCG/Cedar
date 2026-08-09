import { safeCms } from '@/data/cms/safe'
import { getPayloadClient } from '@/lib/payload'
import { siteConfig } from '@/config/site-config'
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

export function mapMoment(doc: Moment): MomentCard {
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
      name: siteConfig.site.nick || siteConfig.site.author,
      avatar: siteConfig.site.avatar
    }
  }
}

export async function getPublishedMoments(limit = 50): Promise<MomentCard[]> {
  return safeCms(
    'getPublishedMoments',
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'moments',
        where: {
          _status: { equals: 'published' }
        },
        depth: 2,
        limit,
        sort: '-publishedAt',
        draft: false,
        overrideAccess: false
      })

      return (result.docs as Moment[]).map(mapMoment)
    },
    []
  )
}
