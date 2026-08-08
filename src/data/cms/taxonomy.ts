import { safeCms } from '@/data/cms/safe'
import type { TaxonomyItem } from '@/data/site-taxonomy'
import { getPayloadClient } from '@/lib/payload'

export async function getCategoriesWithCount(): Promise<TaxonomyItem[]> {
  return safeCms(
    'getCategoriesWithCount',
    async () => {
      const payload = await getPayloadClient()
      const categories = await payload.find({
        collection: 'categories',
        limit: 100,
        sort: 'name',
        depth: 0
      })

      return Promise.all(
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
    },
    []
  )
}

export async function getTagsWithCount(): Promise<TaxonomyItem[]> {
  return safeCms(
    'getTagsWithCount',
    async () => {
      const payload = await getPayloadClient()
      const tags = await payload.find({
        collection: 'tags',
        limit: 200,
        sort: 'name',
        depth: 0
      })

      return Promise.all(
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
    },
    []
  )
}
