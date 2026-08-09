'use client'

import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs'
import Comment from '@/components/comment/comment'
import PageContent from '@/components/page-content/page-content'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

export default function AboutView({
  title,
  html
}: {
  title?: string
  html: string
}) {
  const t = useTranslations('menu')
  const setHeaderImage = useAppStore(s => s.setHeaderImage)
  const resetHeaderImage = useAppStore(s => s.resetHeaderImage)
  const pageTitle = title || t('about')

  useEffect(() => {
    setHeaderImage('/default-cover.jpg')
    return () => resetHeaderImage()
  }, [setHeaderImage, resetHeaderImage])

  return (
    <div className="mt-20">
      <Breadcrumbs current={pageTitle} />
      <PageContent title={pageTitle} comments html={html}>
        <Comment title={pageTitle} uid="about" targetKind="about" />
      </PageContent>
    </div>
  )
}
