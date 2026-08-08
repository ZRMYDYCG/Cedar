'use client'

import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs'
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
  return (
    <div className="mt-20 pb-20">
      <Breadcrumbs current={t('categories')} />
      <MainTitle
        title="titles.category_list"
        icon="category"
        count={categories.length}
      />
      <div className="rounded-2xl bg-ob-deep-800 p-8 shadow-xl">
        <CategoryBox categories={categories} sidebarBox={false} />
      </div>
    </div>
  )
}
