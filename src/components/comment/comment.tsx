'use client'

import MainTitle from '@/components/title/main-title'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'

type CommentProps = {
  title?: string
  body?: string
  uid?: string
}

export default function Comment({ title = '' }: CommentProps) {
  const t = useTranslations('settings')
  const shape = useAppStore(s => s.themeConfig.theme.profile_shape)

  return (
    <div
      className={`comment-${shape} mt-8 bg-ob-deep-800 p-4 lg:px-14 lg:py-10`}
    >
      <MainTitle
        title="titles.comment"
        icon="quote"
        paddings="pb-2 pt-0"
        textSize="text-2xl md:text-3xl"
      />
      <div id="waline" className="mt-4 text-sm text-ob-dim">
        {t('comment-placeholder', {
          title: title || t('default-category')
        })}
      </div>
    </div>
  )
}
