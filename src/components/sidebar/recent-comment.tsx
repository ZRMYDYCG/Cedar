'use client'

import EmptyState from '@/components/empty-state/empty-state'
import SubTitle from '@/components/title/sub-title'
import { useTranslations } from 'next-intl'

export default function RecentComment() {
  const t = useTranslations('settings')

  return (
    <div className="sidebar-box mb-8">
      <SubTitle title="titles.recent_comment" icon="quote" />
      <EmptyState variant="inline" title={t('empty-recent-comments')} />
    </div>
  )
}
