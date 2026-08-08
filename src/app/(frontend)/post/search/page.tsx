import SearchView from '@/app/(frontend)/post/search/search-view'
import { getPostsByTaxonomy } from '@/data/cms/posts'
import { getCategoriesWithCount, getTagsWithCount } from '@/data/cms/taxonomy'

export const dynamic = 'force-dynamic'

export default async function PostSearchPage({
  searchParams
}: {
  searchParams: Promise<{ tag?: string; category?: string }>
}) {
  const params = await searchParams
  const tag = params.tag || ''
  const category = params.category || ''
  const [posts, categories, tags] = await Promise.all([
    getPostsByTaxonomy({ tag, category }),
    getCategoriesWithCount(),
    getTagsWithCount()
  ])

  return (
    <SearchView
      posts={posts}
      tag={tag}
      category={category}
      categories={categories}
      tags={tags}
    />
  )
}
