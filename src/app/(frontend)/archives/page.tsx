import ArchivesView from '@/app/(frontend)/archives/archives-view'
import { getPublishedPosts } from '@/data/cms/posts'

export const dynamic = 'force-dynamic'

export default async function ArchivesPage() {
  const posts = await getPublishedPosts()
  return <ArchivesView posts={posts} />
}
