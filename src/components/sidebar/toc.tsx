'use client'

import EmptyState from '@/components/empty-state/empty-state'
import { useTranslations } from 'next-intl'

export default function Toc({ html }: { html?: string }) {
  const t = useTranslations('settings')

  if (!html) {
    return (
      <div className="sidebar-box">
        <EmptyState variant="inline" title={t('empty-toc')} />
      </div>
    )
  }
  return (
    <div
      className="sidebar-box toc prose prose-invert text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
