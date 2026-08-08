import TagsView from '@/app/(frontend)/tags/tags-view'
import { getTagsWithCount } from '@/data/cms/taxonomy'

export const dynamic = 'force-dynamic'

export default async function TagsPage() {
  const tags = await getTagsWithCount()
  return <TagsView tags={tags} />
}
