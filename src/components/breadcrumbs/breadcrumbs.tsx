'use client'

import { useTranslations } from 'next-intl'

export default function Breadcrumbs({ current }: { current: string }) {
  const t = useTranslations('menu')

  return (
    <ul className="breadcrumbs z-50 flex flex-row gap-6 px-4 text-white">
      <li>{t('home')}</li>
      <li>{current}</li>
    </ul>
  )
}
