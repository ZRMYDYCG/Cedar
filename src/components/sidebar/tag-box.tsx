'use client'

import EmptyState from '@/components/empty-state/empty-state'
import SvgIcon from '@/components/svg-icon/svg-icon'
import TagItem from '@/components/tag/tag-item'
import TagList from '@/components/tag/tag-list'
import SubTitle from '@/components/title/sub-title'
import type { TaxonomyItem } from '@/data/site-taxonomy'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function TagBox({
  tags = [],
  activeTag,
  sidebarBox = true
}: {
  tags?: TaxonomyItem[]
  activeTag?: string
  sidebarBox?: boolean
}) {
  const t = useTranslations('settings')
  const [expand, setExpand] = useState(false)

  return (
    <div
      id="sticky-tag-box"
      className={sidebarBox ? 'sidebar-box' : undefined}
    >
      <SubTitle title="titles.tag_list" icon="tag" />
      {tags.length > 0 ? (
        <TagList
          className={`relative overflow-hidden text-ellipsis ${expand ? 'h-full' : 'max-h-98'}`}
        >
          {tags.map(tag => (
            <TagItem
              key={tag.slug}
              name={tag.name}
              slug={tag.slug}
              count={tag.count}
              active={!!activeTag && tag.slug === activeTag}
              size="small"
            />
          ))}
          {!expand ? (
            <div
              className="more-cover absolute bottom-0 left-0 z-10 flex w-full justify-center"
              style={{ height: '40%' }}
            >
              <div
                className="more-btn absolute bottom-0 left-0 flex h-9 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg bg-ob-deep-900 shadow-md"
                onClick={() => setExpand(true)}
              >
                <SvgIcon
                  iconClass="more"
                  height="1.1em"
                  width="1.1em"
                  fill="var(--text-normal)"
                  stroke="var(--text-normal)"
                />
                <span className="text-xs">{t('more-tags')}</span>
              </div>
            </div>
          ) : null}
        </TagList>
      ) : (
        <EmptyState variant="inline" title={t('empty-tag')} />
      )}
    </div>
  )
}