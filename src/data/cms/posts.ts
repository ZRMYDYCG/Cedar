import { mapPostToCard, type PostCardWithHtml } from '@/data/cms/map-post'
import { getPayloadClient } from '@/lib/payload'
import type { Post } from '@/payload-types'
import type { Where } from 'payload'

const published: Where = {
  _status: { equals: 'published' }
}

async function findPosts(where: Where = published, limit = 100) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'posts',
    where,
    depth: 2,
    limit,
    sort: '-publishedAt',
    draft: false,
    overrideAccess: false
  })
  return result.docs as Post[]
}

export async function getPublishedPosts(): Promise<PostCardWithHtml[]> {
  const docs = await findPosts(published, 200)
  return docs.map(doc => mapPostToCard(doc))
}

export async function getFeaturedPosts(): Promise<{
  feature?: PostCardWithHtml
  featureList: PostCardWithHtml[]
}> {
  const docs = await findPosts(
    {
      and: [published, { featured: { equals: true } }]
    },
    12
  )
  const cards = docs.map(doc => mapPostToCard(doc))
  return {
    feature: cards[0],
    featureList: cards.slice(1)
  }
}

export async function getPostBySlug(
  slug: string
): Promise<PostCardWithHtml | null> {
  const docs = await findPosts(
    {
      and: [published, { slug: { equals: slug } }]
    },
    1
  )
  if (!docs[0]) return null
  return mapPostToCard(docs[0], { withHtml: true })
}

export async function getAdjacentPosts(slug: string): Promise<{
  prev?: PostCardWithHtml
  next?: PostCardWithHtml
}> {
  const all = await getPublishedPosts()
  const index = all.findIndex(post => post.slug === slug)
  if (index < 0) return {}
  return {
    prev: index > 0 ? all[index - 1] : undefined,
    next: index < all.length - 1 ? all[index + 1] : undefined
  }
}

export async function getPostsByTaxonomy(options: {
  tag?: string
  category?: string
}): Promise<PostCardWithHtml[]> {
  const posts = await getPublishedPosts()
  if (options.tag) {
    return posts.filter(post =>
      post.tags?.some(item => item.slug === options.tag)
    )
  }
  if (options.category) {
    return posts.filter(post =>
      post.categories?.some(item => item.slug === options.category)
    )
  }
  return posts
}

export async function getSiteStats() {
  const payload = await getPayloadClient()
  const [posts, categories, tags] = await Promise.all([
    payload.count({ collection: 'posts', where: published }),
    payload.count({ collection: 'categories' }),
    payload.count({ collection: 'tags' })
  ])
  const publishedPosts = await getPublishedPosts()
  const wordCount = publishedPosts.reduce(
    (sum, post) => sum + (post.count_time?.symbolsCount || 0),
    0
  )
  return {
    word_count: wordCount,
    post_count: posts.totalDocs,
    categories: categories.totalDocs,
    tags: tags.totalDocs
  }
}
