'use client'

import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs'
import EmptyState from '@/components/empty-state/empty-state'
import TagItem from '@/components/tag/tag-item'
import TagList from '@/components/tag/tag-list'
import type { TaxonomyItem } from '@/data/site-taxonomy'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

export default function TagsView({ tags }: { tags: TaxonomyItem[] }) {
  const t = useTranslations('menu')
  const tSettings = useTranslations('settings')
  const setHeaderImage = useAppStore(s => s.setHeaderImage)
  const resetHeaderImage = useAppStore(s => s.resetHeaderImage)
  const pageTitle = t('tags')

  useEffect(() => {
    setHeaderImage('/default-cover.jpg')
    return () => resetHeaderImage()
  }, [setHeaderImage, resetHeaderImage])

  return (
    <div className="mt-20 flex flex-col">
      <Breadcrumbs current={pageTitle} />
      <div className="post-header">
        <h1 className="post-title uppercase text-white">{pageTitle}</h1>
      </div>
      <div className="block rounded-2xl bg-ob-deep-800 px-14 py-16 shadow-xl">
        {tags.length > 0 ? (
          <TagList>
            {tags.map(tag => (
              <TagItem
                key={tag.slug}
                name={tag.name}
                slug={tag.slug}
                count={tag.count}
                size="large"
              />
            ))}
          </TagList>
        ) : (
          <EmptyState title={tSettings('empty-tag')} />
        )}
      </div>
    </div>
  )
}
