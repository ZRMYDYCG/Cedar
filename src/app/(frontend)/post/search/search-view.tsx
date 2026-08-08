'use client'

import ArticleCard from '@/components/article-card/article-card'
import CategoryBox from '@/components/sidebar/category-box'
import Sidebar from '@/components/sidebar/sidebar'
import TagBox from '@/components/sidebar/tag-box'
import SvgIcon from '@/components/svg-icon/svg-icon'
import type { TaxonomyItem } from '@/data/site-taxonomy'
import { useAppStore } from '@/stores/app'
import type { PostCard } from '@/types/post'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

export default function SearchView({
  posts,
  tag,
  category,
  categories,
  tags
}: {
  posts: PostCard[]
  tag: string
  category: string
  categories: TaxonomyItem[]
  tags: TaxonomyItem[]
}) {
  const t = useTranslations('settings')
  const setHeaderImage = useAppStore(s => s.setHeaderImage)
  const resetHeaderImage = useAppStore(s => s.resetHeaderImage)

  useEffect(() => {
    setHeaderImage('/default-cover.jpg')
    return () => resetHeaderImage()
  }, [setHeaderImage, resetHeaderImage])

  const title = tag || category || 'search'

  return (
    <div className="mt-10">
      <div className="post-header mb-8">
        <h1 className="post-title flex items-center uppercase text-white">
          {tag ? (
            <SvgIcon iconClass="tag" stroke="white" className="mr-2" />
          ) : null}
          {category ? (
            <SvgIcon iconClass="category" stroke="white" className="mr-2" />
          ) : null}
          {title}
        </h1>
      </div>
      <div className="main-grid">
        {posts.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map(post => (
              <ArticleCard key={post.slug} data={post} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <SvgIcon
              iconClass="empty-search"
              width="12rem"
              height="12rem"
              className="opacity-40"
            />
            <p className="mt-4 text-ob-dim">{t('no-search-result')}</p>
          </div>
        )}
        <Sidebar>
          <CategoryBox categories={categories} activeCategory={category} />
          <div className="mt-8">
            <TagBox tags={tags} activeTag={tag} />
          </div>
        </Sidebar>
      </div>
    </div>
  )
}
