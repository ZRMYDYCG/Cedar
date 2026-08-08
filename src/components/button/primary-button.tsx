'use client'

import { useAppStore } from '@/stores/app'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type PrimaryButtonProps = {
  text?: string
  children?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function PrimaryButton({
  text,
  children,
  className = '',
  ...rest
}: PrimaryButtonProps) {
  const gradient = useAppStore(s => s.themeConfig.theme.header_gradient_css)

  return (
    <button
      type="button"
      className={`z-10 flex cursor-pointer select-none items-center justify-center rounded-xl px-3 py-1 font-semibold text-white transition ${className}`}
      style={{ background: gradient }}
      {...rest}
    >
      {children ?? text}
    </button>
  )
}
