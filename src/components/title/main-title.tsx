'use client'

import SvgIcon from '@/components/svg-icon/svg-icon'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'

type MainTitleProps = {
  title: string
  id?: string
  icon?: string
  textSize?: string
  paddings?: string
  margins?: string
  count?: number
  uppercase?: boolean
}

export default function MainTitle({
  title,
  id,
  icon,
  textSize = 'text-3xl',
  paddings = 'pt-12 pb-2',
  margins = 'mb-8',
  count,
  uppercase = true
}: MainTitleProps) {
  const t = useTranslations()
  const gradient = useAppStore(s => s.themeConfig.theme.header_gradient_css)

  return (
    <p
      id={id}
      className={`relative flex items-center opacity-90 text-ob-bright ${
        uppercase ? 'uppercase' : ''
      } ${paddings} ${margins} ${textSize}`}
    >
      {icon ? (
        <SvgIcon
          iconClass={icon}
          className="mr-2 inline-block"
          fill="none"
          stroke="currentColor"
        />
      ) : null}
      {t(title)}
      {typeof count === 'number' ? (
        <span className="ml-2">({count})</span>
      ) : null}
      <span
        className="absolute bottom-0 h-1 w-24 rounded-full"
        style={{ background: gradient }}
      />
    </p>
  )
}
