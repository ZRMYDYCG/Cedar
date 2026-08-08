'use client'

import ArticleCard from '@/components/article-card/article-card'
import SvgIcon from '@/components/svg-icon/svg-icon'
import { useAppStore } from '@/stores/app'
import type { PostCard } from '@/types/post'
import { useTranslations } from 'next-intl'
import type { CSSProperties } from 'react'

type FeatureListProps = {
  data: PostCard[]
}

export default function FeatureList({ data }: FeatureListProps) {
  const t = useTranslations('home')
  const theme = useAppStore(s => s.themeConfig.theme)
  const posts = data.length > 0 ? data : [{}, {}]

  return (
    <div className="inverted-main-grid box-border gap-7 py-7">
      <div className="relative h-56 overflow-hidden rounded-2xl bg-ob-deep-800 shadow-lg lg:h-auto">
        <div className="ob-gradient-plate relative z-10 flex items-end justify-start rounded-2xl bg-ob-deep-900 px-6 pb-10 opacity-90 shadow-md">
          <h2 className="pb-8 text-3xl lg:pb-14">
            <p style={theme.background_gradient_style as CSSProperties}>
              EDITOR&apos;S SELECTION
            </p>
            <span className="relative text-lg font-semibold text-ob-bright">
              <SvgIcon className="inline-block" iconClass="hot" stroke="white" />
              {t('recommended')}
            </span>
          </h2>
        </div>
        <span
          className="absolute top-0 z-0 h-full w-full"
          style={{ background: theme.header_gradient_css }}
        />
      </div>

      <ul className="grid gap-7 lg:grid-cols-2">
        {posts.map((post, index) => (
          <ArticleCard
            key={post.slug || `feature-skeleton-${index}`}
            data={post}
          />
        ))}
      </ul>
    </div>
  )
}
