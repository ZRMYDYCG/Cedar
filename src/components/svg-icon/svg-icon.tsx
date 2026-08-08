'use client'

import { useAppStore } from '@/stores/app'
import type { CSSProperties } from 'react'
import type { SvgIconName } from './svg-sprite-data'

export type SvgTypes = 'fill' | 'stroke'

type SvgIconProps = {
  iconClass: SvgIconName | (string & {})
  className?: string
  fill?: string
  stroke?: string
  svgType?: SvgTypes
  width?: string | number
  height?: string | number
  style?: CSSProperties
}

const isExternalIcon = (path: string) =>
  /^(\/)+([a-zA-Z0-9\s_\\.\-():/])+(.svg|.png|.jpg)$/g.test(path) ||
  /^https?:\/\//.test(path)

export default function SvgIcon({
  iconClass,
  className = '',
  fill = '',
  stroke = '',
  svgType = 'fill',
  width = '1em',
  height = '1em',
  style
}: SvgIconProps) {
  const theme = useAppStore(s => s.theme)
  const external = isExternalIcon(iconClass)

  const svgStyle: CSSProperties =
    svgType === 'fill'
      ? {
          fill: fill || 'currentColor',
          stroke:
            stroke ||
            (theme === 'theme-dark' ? 'var(--background-primary)' : 'white'),
          width,
          height,
          ...style
        }
      : {
          fill: fill || 'none',
          stroke:
            stroke || (theme === 'theme-dark' ? 'white' : 'currentColor'),
          width,
          height,
          ...style
        }

  if (external) {
    // External URLs are rare; keep a simple img fallback.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`svg-icon external-icon ${className}`}
        src={iconClass}
        alt=""
        style={{ width, height }}
        aria-hidden
      />
    )
  }

  return (
    <svg
      className={`svg-icon ${className}`}
      aria-hidden
      style={svgStyle}
    >
      <use
        href={`#icon-${iconClass}`}
        fill={fill !== '' ? fill : undefined}
        stroke={stroke !== '' ? stroke : undefined}
      />
    </svg>
  )
}
