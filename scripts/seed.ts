import config from '@payload-config'
import { getPayload } from 'payload'

function lexical(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              version: 1
            }
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1
        }
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1
    }
  }
}

function date(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day, 12, 0, 0)).toISOString()
}

const seedPosts = [
  {
    title: 'Hello Cedar',
    slug: 'hello-cedar',
    coverUrl: '/default-cover.jpg',
    excerpt: 'First note on Cedar — a personal site built with Next.js and Payload.',
    featured: true,
    pinned: true,
    categories: ['notes'],
    tags: ['cedar', 'blog'],
    publishedAt: date(2026, 7, 9)
  },
  {
    title: 'Writing in the open',
    slug: 'writing-in-the-open',
    coverUrl: '/default-cover.jpg',
    excerpt: 'Publish drafts from the admin panel; the front reads only published posts.',
    featured: true,
    categories: ['notes'],
    tags: ['cms'],
    publishedAt: date(2026, 6, 18)
  }
] as const

const categoryDefs = [['Notes', 'notes']] as const
const tagSlugs = ['cedar', 'blog', 'cms'] as const

async function upsertBySlug(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'categories' | 'tags' | 'posts' | 'pages',
  slug: string,
  data: Record<string, unknown>
) {
  const existing = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true
  })
  if (existing.docs[0]) {
    return payload.update({
      collection,
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
      draft: false
    })
  }
  return payload.create({
    collection,
    data,
    overrideAccess: true,
    draft: false
  })
}

export async function seed() {
  const payload = await getPayload({ config })
  const categoryIds: Record<string, number> = {}
  const tagIds: Record<string, number> = {}

  for (const [name, slug] of categoryDefs) {
    const doc = await upsertBySlug(payload, 'categories', slug, { name, slug })
    categoryIds[slug] = doc.id as number
  }

  for (const slug of tagSlugs) {
    const doc = await upsertBySlug(payload, 'tags', slug, { name: slug, slug })
    tagIds[slug] = doc.id as number
  }

  for (const post of seedPosts) {
    await upsertBySlug(payload, 'posts', post.slug, {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverUrl: post.coverUrl,
      content: lexical(post.excerpt),
      featured: Boolean('featured' in post && post.featured),
      pinned: Boolean('pinned' in post && post.pinned),
      publishedAt: post.publishedAt,
      categories: post.categories.map(slug => categoryIds[slug]),
      tags: post.tags.map(slug => tagIds[slug]),
      _status: 'published'
    })
    console.log('post', post.slug)
  }

  await upsertBySlug(payload, 'pages', 'about', {
    title: '关于',
    slug: 'about',
    content: lexical(
      '你好，我是一勺（Cedar）。人生是长久的积累。这里是我的个人站点：记一点笔记，记一些碎碎念，把技术与日常慢慢留下。'
    ),
    _status: 'published'
  })
  console.log('Seed complete.')
}

await seed()
process.exit(0)
