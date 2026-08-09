import { siteConfig } from '@/config/site-config'
import type { Category, Media, Post, Tag, User } from '@/payload-types'
import type { PostCard, PostDate, PostTaxonomy } from '@/types/post'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

type SiteProfile = Pick<
  (typeof siteConfig)['site'],
  'author' | 'avatar' | 'nick'
>

function asTaxonomy(
  items: (number | Category | Tag)[] | null | undefined
): PostTaxonomy[] {
  if (!items?.length) return []
  return items
    .filter((item): item is Category | Tag => typeof item === 'object' && item !== null)
    .map(item => ({ name: item.name, slug: item.slug }))
}

function toPostDate(raw?: string | null): PostDate | undefined {
  if (!raw) return undefined
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return undefined
  return {
    // Full next-intl key for root translator: t('settings.months.7')
    month: `settings.months.${d.getMonth()}`,
    day: d.getDate(),
    year: d.getFullYear()
  }
}

function mediaUrl(cover: Post['cover'], coverUrl?: string | null): string {
  if (cover && typeof cover === 'object') {
    const media = cover as Media
    if (media.url) return media.url
  }
  if (coverUrl) return coverUrl
  return '/default-cover.jpg'
}

function authorFrom(user: Post['author'], site: SiteProfile = siteConfig.site) {
  if (user && typeof user === 'object') {
    const u = user as User
    const avatar =
      u.avatar && typeof u.avatar === 'object'
        ? (u.avatar as Media).url || site.avatar
        : site.avatar
    return {
      name: u.name || site.author,
      avatar: avatar || site.avatar,
      link: '/'
    }
  }
  return {
    name: site.author,
    avatar: site.avatar,
    link: '/'
  }
}

function estimateReading(text: string) {
  const symbolsCount = text.replace(/\s+/g, '').length || text.length
  const mins = Math.max(1, Math.round(symbolsCount / 400))
  return {
    symbolsCount,
    // Numeric minutes; PostStats localizes via settings.reading-time
    symbolsTime: String(mins)
  }
}

export type PostCardWithHtml = PostCard & { html?: string }

export function mapPostToCard(
  post: Post,
  options: { withHtml?: boolean; site?: SiteProfile } = {}
): PostCardWithHtml {
  const site = options.site || siteConfig.site
  const excerpt = post.excerpt || ''
  const html = options.withHtml
    ? convertLexicalToHTML({ data: post.content })
    : undefined
  const plain =
    excerpt ||
    (html ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '')

  const tags = asTaxonomy(post.tags)
  return {
    title: post.title,
    slug: post.slug,
    cover: mediaUrl(post.cover, post.coverUrl),
    text: plain,
    excerpt,
    pinned: Boolean(post.pinned),
    feature: Boolean(post.featured),
    categories: asTaxonomy(post.categories),
    tags,
    min_tags: tags.slice(0, 2),
    author: authorFrom(post.author, site),
    date: toPostDate(post.publishedAt || post.createdAt),
    count_time: estimateReading(plain),
    html
  }
}

export function paragraphLexical(text: string) {
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
