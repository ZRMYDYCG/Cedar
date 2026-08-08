'use client'

import SvgIcon from '@/components/svg-icon/svg-icon'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'

type SubTitleProps = {
  title: string
  side?: 'left' | 'right'
  icon?: string
  count?: number
  uppercase?: boolean
}

export default function SubTitle({
  title,
  side = 'left',
  icon,
  count,
  uppercase = true
}: SubTitleProps) {
  const t = useTranslations()
  const gradient = useAppStore(s => s.themeConfig.theme.header_gradient_css)

  return (
    <p
      className={`relative mb-4 flex items-center pb-2 text-xl text-ob-bright ${
        uppercase ? 'uppercase' : ''
      }`}
    >
      {icon && side === 'left' ? (
        <SvgIcon
          iconClass={icon}
          className="mr-2 inline-block"
          fill="none"
          stroke="currentColor"
        />
      ) : null}
      <span className={`block w-full ${side === 'right' ? 'text-right' : ''}`}>
        {t(title)}
        {typeof count === 'number' ? (
          <span className="ml-2">({count})</span>
        ) : null}
      </span>
      {icon && side === 'right' ? (
        <SvgIcon iconClass={icon} className="ml-2 inline-block" />
      ) : null}
      <span
        className={`absolute bottom-0 h-1 w-14 rounded-full ${
          side === 'right' ? 'right-0' : ''
        }`}
        style={{ background: gradient }}
      />
    </p>
  )
}
