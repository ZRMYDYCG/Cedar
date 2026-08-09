import { siteConfig } from '@/config/site-config'
import { lexicalToHtml } from '@/lib/lexical-html'
import type { Category, Media, Post, Tag, User } from '@/payload-types'
import type { PostCard, PostDate, PostTaxonomy } from '@/types/post'

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

/** Walk Lexical JSON and collect visible text (no HTML round-trip). */
function lexicalToPlainText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  if (Array.isArray(node)) {
    return node.map(lexicalToPlainText).filter(Boolean).join(' ')
  }

  const value = node as {
    text?: unknown
    type?: unknown
    children?: unknown
    root?: unknown
    fields?: { code?: unknown }
  }

  // Serialized editor state is `{ root: { children: [...] } }`.
  if (value.root) {
    return lexicalToPlainText(value.root)
  }

  // Lexical Code blocks store source in `fields.code`.
  if (
    value.type === 'block' &&
    typeof value.fields?.code === 'string' &&
    value.fields.code
  ) {
    return `${value.fields.code} `
  }

  if (typeof value.text === 'string' && value.text) {
    return value.text
  }

  const childText = lexicalToPlainText(value.children)
  if (!childText) return ''

  // Separate block-level nodes so list items / paragraphs don't run together.
  if (
    value.type === 'paragraph' ||
    value.type === 'heading' ||
    value.type === 'listitem' ||
    value.type === 'quote'
  ) {
    return `${childText} `
  }

  return childText
}

function truncatePlain(text: string, max = 160): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max).trimEnd()}…`
}

export type PostCardWithHtml = PostCard & { html?: string }

export function mapPostToCard(
  post: Post,
  options: { withHtml?: boolean; site?: SiteProfile } = {}
): PostCardWithHtml {
  const site = options.site || siteConfig.site
  const excerpt = (post.excerpt || '').trim()
  const html = options.withHtml ? lexicalToHtml(post.content) : undefined
  // List cards used to leave `text` empty when excerpt was missing and
  // withHtml was false — ArticleCard then showed a permanent skeleton.
  const fromBody = truncatePlain(lexicalToPlainText(post.content))
  const plain = excerpt || fromBody

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
    count_time: estimateReading(
      excerpt || lexicalToPlainText(post.content).replace(/\s+/g, ' ').trim()
    ),
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
