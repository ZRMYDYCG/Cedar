import CategoryView from '@/app/(frontend)/category/category-view'
import { getCategoriesWithCount } from '@/data/cms/taxonomy'

export const dynamic = 'force-dynamic'

export default async function CategoryPage() {
  const categories = await getCategoriesWithCount()
  return <CategoryView categories={categories} />
}
