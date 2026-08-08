import { getPayloadClient } from '@/lib/payload'
import type { TaxonomyItem } from '@/data/site-taxonomy'

export async function getCategoriesWithCount(): Promise<TaxonomyItem[]> {
  const payload = await getPayloadClient()
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'name',
    depth: 0
  })

  const items = await Promise.all(
    categories.docs.map(async category => {
      const count = await payload.count({
        collection: 'posts',
        where: {
          and: [
            { _status: { equals: 'published' } },
            { categories: { contains: category.id } }
          ]
        }
      })
      return {
        name: category.name,
        slug: category.slug,
        count: count.totalDocs
      }
    })
  )

  return items
}

export async function getTagsWithCount(): Promise<TaxonomyItem[]> {
  const payload = await getPayloadClient()
  const tags = await payload.find({
    collection: 'tags',
    limit: 200,
    sort: 'name',
    depth: 0
  })

  const items = await Promise.all(
    tags.docs.map(async tag => {
      const count = await payload.count({
        collection: 'posts',
        where: {
          and: [
            { _status: { equals: 'published' } },
            { tags: { contains: tag.id } }
          ]
        }
      })
      return {
        name: tag.name,
        slug: tag.slug,
        count: count.totalDocs
      }
    })
  )

  return items
}
