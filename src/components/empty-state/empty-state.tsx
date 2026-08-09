'use client'

import SvgIcon from '@/components/svg-icon/svg-icon'
import type { SvgIconName } from '@/components/svg-icon/svg-sprite-data'
import type { CSSProperties, ReactNode } from 'react'

export type EmptyStateVariant = 'page' | 'panel' | 'inline'

type EmptyStateProps = {
  title: ReactNode
  description?: ReactNode
  icon?: SvgIconName | (string & {})
  variant?: EmptyStateVariant
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

const DEFAULT_ICON: Record<EmptyStateVariant, SvgIconName> = {
  page: 'empty-search',
  panel: 'empty-search',
  inline: 'warning'
}

export default function EmptyState({
  title,
  description,
  icon,
  variant = 'page',
  className = '',
  style,
  children
}: EmptyStateProps) {
  const resolvedIcon = icon ?? DEFAULT_ICON[variant]
  const isInline = variant === 'inline'

  return (
    <div
      className={`empty-state empty-state--${variant} ${className}`.trim()}
      style={style}
      role="status"
    >
      <SvgIcon
        iconClass={resolvedIcon}
        className="empty-state__icon"
        width={isInline ? '1.25rem' : variant === 'panel' ? '6rem' : '12rem'}
        height={isInline ? '1.25rem' : variant === 'panel' ? '6rem' : '12rem'}
        stroke={isInline ? 'var(--text-dim)' : undefined}
        fill={isInline ? 'var(--text-dim)' : undefined}
      />
      <div className="empty-state__body">
        <p className="empty-state__title">{title}</p>
        {description ? (
          <div className="empty-state__description">{description}</div>
        ) : null}
        {children ? <div className="empty-state__action">{children}</div> : null}
      </div>
    </div>
  )
}
