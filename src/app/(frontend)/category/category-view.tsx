'use client'

import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs'
import EmptyState from '@/components/empty-state/empty-state'
import CategoryBox from '@/components/sidebar/category-box'
import MainTitle from '@/components/title/main-title'
import type { TaxonomyItem } from '@/data/site-taxonomy'
import { useTranslations } from 'next-intl'

export default function CategoryView({
  categories
}: {
  categories: TaxonomyItem[]
}) {
  const t = useTranslations('menu')
  const tSettings = useTranslations('settings')
  return (
    <div className="mt-20 pb-20">
      <Breadcrumbs current={t('categories')} />
      <MainTitle
        title="titles.category_list"
        icon="category"
        count={categories.length}
      />
      <div className="rounded-2xl bg-ob-deep-800 p-8 shadow-xl">
        {categories.length > 0 ? (
          <CategoryBox categories={categories} sidebarBox={false} />
        ) : (
          <EmptyState title={tSettings('empty-category')} />
        )}
      </div>
    </div>
  )
}
