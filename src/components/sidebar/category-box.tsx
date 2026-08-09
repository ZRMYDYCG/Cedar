'use client'

import EmptyState from '@/components/empty-state/empty-state'
import SubTitle from '@/components/title/sub-title'
import type { TaxonomyItem } from '@/data/site-taxonomy'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

export default function CategoryBox({
  categories = [],
  activeCategory = '',
  sidebarBox = true
}: {
  categories?: TaxonomyItem[]
  activeCategory?: string
  sidebarBox?: boolean
}) {
  const router = useRouter()
  const t = useTranslations('settings')
  const gradient = useAppStore(s => s.themeConfig.theme.header_gradient_css)

  return (
    <div className={sidebarBox ? 'sidebar-box' : undefined}>
      {sidebarBox ? <SubTitle title="titles.category_list" icon="category" /> : null}
      {categories.length > 0 ? (
        <ul className="flex cursor-pointer flex-wrap justify-evenly gap-2 pt-2">
          {categories.map(category => (
            <li
              key={category.slug}
              className="flex flex-row items-center hover:opacity-50"
              onClick={() =>
                router.push(`/post/search?category=${category.slug}`)
              }
            >
              <span
                className="rounded-tl-md rounded-bl-md bg-ob-deep-900 px-3 py-1 text-center text-sm"
                style={
                  category.slug === activeCategory
                    ? { background: gradient, color: '#fff', opacity: 1 }
                    : undefined
                }
              >
                {category.name}
              </span>
              <b className="rounded-tr-md rounded-br-md bg-ob-deep-900 px-2 py-1 text-center text-sm text-ob opacity-70">
                {category.count}
              </b>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState variant="inline" title={t('empty-category')} />
      )}
    </div>
  )
}
