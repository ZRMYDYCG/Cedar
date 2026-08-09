import 'server-only'

import type { JoyCard } from '@/data/cms/joys-shared'
import { safeCms } from '@/data/cms/safe'
import { getPayloadClient } from '@/lib/payload'
import type { Joy } from '@/payload-types'

export type { JoyCard } from '@/data/cms/joys-shared'

function mapJoy(doc: Joy): JoyCard | null {
  if (!doc.day || !doc.item1 || !doc.item2 || !doc.item3) return null
  return {
    id: doc.id,
    day: doc.day,
    items: [doc.item1, doc.item2, doc.item3]
  }
}

export async function getPublishedJoys(limit = 365): Promise<JoyCard[]> {
  return safeCms(
    'getPublishedJoys',
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'joys',
        where: { _status: { equals: 'published' } },
        sort: '-day',
        limit,
        depth: 0,
        draft: false,
        overrideAccess: false
      })
      return (result.docs as Joy[])
        .map(mapJoy)
        .filter((item): item is JoyCard => Boolean(item))
    },
    []
  )
}
