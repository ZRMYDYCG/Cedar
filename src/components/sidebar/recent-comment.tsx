'use client'

import SvgIcon from '@/components/svg-icon/svg-icon'
import SubTitle from '@/components/title/sub-title'
import { useTranslations } from 'next-intl'

export default function RecentComment() {
  const t = useTranslations('settings')

  return (
    <div className="sidebar-box mb-8">
      <SubTitle title="titles.recent_comment" icon="quote" />
      <div className="flex flex-row items-center justify-center text-ob-dim">
        <SvgIcon className="mr-2" iconClass="warning" stroke="var(--text-dim)" />
        {t('empty-recent-comments')}
      </div>
    </div>
  )
}
