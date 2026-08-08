import HomeView from '@/app/(frontend)/home-view'
import {
  getFeaturedPosts,
  getPublishedPosts,
  getSiteStats
} from '@/data/cms/posts'
import { safeCms } from '@/data/cms/safe'
import { getCategoriesWithCount, getTagsWithCount } from '@/data/cms/taxonomy'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [posts, featured, categories, tags, stats] = await Promise.all([
    safeCms('posts', getPublishedPosts, []),
    safeCms('featured', getFeaturedPosts, { featureList: [] }),
    safeCms('categories', getCategoriesWithCount, []),
    safeCms('tags', getTagsWithCount, []),
    safeCms('stats', getSiteStats, {
      word_count: 0,
      post_count: 0,
      categories: 0,
      tags: 0
    })
  ])

  return (
    <HomeView
      posts={posts}
      feature={featured.feature}
      featureList={featured.featureList}
      categories={categories}
      tags={tags}
      stats={{
        word_count: stats.word_count,
        post_count: stats.post_count,
        categories: stats.categories,
        tags: stats.tags
      }}
    />
  )
}
