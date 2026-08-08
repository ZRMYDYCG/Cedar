import { getPublishedPosts } from '@/data/cms/posts'
import { NextResponse } from 'next/server'

export async function GET() {
  const posts = await getPublishedPosts()
  return NextResponse.json({
    docs: posts.map(post => ({
      slug: post.slug,
      title: post.title,
      text: post.text,
      cover: post.cover,
      categories: post.categories,
      tags: post.tags
    }))
  })
}
