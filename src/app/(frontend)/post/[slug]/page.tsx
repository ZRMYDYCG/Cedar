import PostView from '@/app/(frontend)/post/[slug]/post-view'
import { getAdjacentPosts, getPostBySlug } from '@/data/cms/posts'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PostSlugPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const { prev, next } = await getAdjacentPosts(slug)

  return <PostView post={post} prev={prev} next={next} />
}
