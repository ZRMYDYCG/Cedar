'use client'

import ArticleCard from '@/components/article-card/article-card'
import EmptyState from '@/components/empty-state/empty-state'
import Feature from '@/components/feature/feature'
import FeatureList from '@/components/feature/feature-list'
import Paginator from '@/components/paginator/paginator'
import Profile from '@/components/sidebar/profile'
import RecentComment from '@/components/sidebar/recent-comment'
import Sidebar from '@/components/sidebar/sidebar'
import TagBox from '@/components/sidebar/tag-box'
import Sticky from '@/components/sticky/sticky'
import SvgIcon from '@/components/svg-icon/svg-icon'
import type { CommentCard } from '@/data/cms/comments'
import type { TaxonomyItem } from '@/data/site-taxonomy'
import { useAppStore } from '@/stores/app'
import type { PostCard } from '@/types/post'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

type HomeViewProps = {
  posts: PostCard[]
  feature?: PostCard
  featureList: PostCard[]
  categories: TaxonomyItem[]
  tags: TaxonomyItem[]
  recentComments?: CommentCard[]
  stats: {
    word_count: number
    post_count: number
    categories: number
    tags: number
  }
}

export default function HomeView({
  posts,
  feature,
  featureList,
  categories,
  tags,
  recentComments = [],
  stats
}: HomeViewProps) {
  const t = useTranslations('settings')
  const themeConfig = useAppStore(s => s.themeConfig)
  const featureEnabled = themeConfig.theme.feature
  const [activeTab, setActiveTab] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 12

  const listPosts = useMemo(() => {
    if (!activeTab) return posts
    return posts.filter(post =>
      post.categories?.some(category => category.slug === activeTab)
    )
  }, [activeTab, posts])

  const pagePosts = useMemo(() => {
    const start = (page - 1) * pageSize
    return listPosts.slice(start, start + pageSize)
  }, [listPosts, page])

  const activeTabStyle = (slug: string) =>
    activeTab === slug
      ? { background: themeConfig.theme.header_gradient_css }
      : undefined

  return (
    <div className="mt-8 block">
      {featureEnabled && feature ? (
        <Feature data={feature}>
          <FeatureList data={featureList} />
        </Feature>
      ) : null}

      <div className="main-grid" id="article-list">
        <div className="relative flex flex-col">
          {posts.length > 0 ? (
            <div className="article-tabs">
              <ul className={`tab ${expanded ? 'expanded-tab' : ''}`}>
                <li
                  className={activeTab === '' ? 'active' : ''}
                  onClick={() => {
                    setActiveTab('')
                    setPage(1)
                  }}
                >
                  <span className="first-tab" style={activeTabStyle('')}>
                    {t('button-all')}
                  </span>
                </li>
                {categories.map(category => (
                  <li
                    key={category.slug}
                    className={activeTab === category.slug ? 'active' : ''}
                    onClick={() => {
                      setActiveTab(category.slug)
                      setPage(1)
                    }}
                  >
                    <span style={activeTabStyle(category.slug)}>
                      {category.name}
                    </span>
                    <b style={activeTabStyle(category.slug)}>
                      {category.count}
                    </b>
                  </li>
                ))}
              </ul>

              {categories.length > 0 ? (
                <button
                  type="button"
                  className={`tab-expander ${expanded ? 'expanded' : ''}`}
                  aria-expanded={expanded}
                  aria-label={
                    expanded
                      ? t('collapse-categories')
                      : t('expand-categories')
                  }
                  onClick={() => setExpanded(value => !value)}
                >
                  <SvgIcon
                    iconClass="chevron"
                    height="1.05rem"
                    width="1.05rem"
                    fill="var(--text-normal)"
                    stroke="var(--text-normal)"
                  />
                </button>
              ) : null}
            </div>
          ) : null}

          {pagePosts.length > 0 ? (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pagePosts.map(post => (
                <ArticleCard key={post.slug} data={post} />
              ))}
            </ul>
          ) : (
            <EmptyState
              title={
                activeTab ? t('no-search-result') : t('empty-posts')
              }
            />
          )}

          {listPosts.length > 0 ? (
            <Paginator
              page={page}
              pageSize={pageSize}
              pageTotal={listPosts.length}
              onPageChange={setPage}
            />
          ) : null}
        </div>
        <div>
          <Sidebar>
            <Profile stats={stats} />
            <RecentComment comments={recentComments} />
            <Sticky stickyTop={95}>
              <TagBox tags={tags} />
            </Sticky>
          </Sidebar>
        </div>
      </div>
    </div>
  )
}
