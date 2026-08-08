'use client'

import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs'
import Comment from '@/components/comment/comment'
import PageContent from '@/components/page-content/page-content'
import { useAppStore } from '@/stores/app'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function CustomPage() {
  const params = useParams<{ slug: string }>()
  const title = params.slug.replace(/-/g, ' ')
  const setHeaderImage = useAppStore(s => s.setHeaderImage)
  const resetHeaderImage = useAppStore(s => s.resetHeaderImage)

  useEffect(() => {
    setHeaderImage('/default-cover.jpg')
    return () => resetHeaderImage()
  }, [setHeaderImage, resetHeaderImage])

  return (
    <div className="mt-20">
      <Breadcrumbs current={title} />
      <PageContent
        title={title}
        wordCount={640}
        timeCount="2 mins"
        comments
        html={`<p>Custom page for <strong>${params.slug}</strong>. Content will come from Payload pages collection.</p>`}
      >
        <Comment title={title} uid={params.slug} />
      </PageContent>
    </div>
  )
}
