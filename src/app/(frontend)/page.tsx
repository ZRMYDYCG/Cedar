import HomeView from '@/app/(frontend)/home-view'
import {
  getFeaturedPosts,
  getPublishedPosts,
  getSiteStats
} from '@/data/cms/posts'
import { getCategoriesWithCount, getTagsWithCount } from '@/data/cms/taxonomy'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [posts, featured, categories, tags, stats] = await Promise.all([
    getPublishedPosts(),
    getFeaturedPosts(),
    getCategoriesWithCount(),
    getTagsWithCount(),
    getSiteStats()
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
