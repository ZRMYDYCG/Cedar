'use client'

import type { ReactNode } from 'react'
import { useDropdown } from './dropdown'

export default function DropdownMenu({
  children,
  expand = false
}: {
  children: ReactNode
  expand?: boolean
}) {
  const { active, hover } = useDropdown()
  if (!active) return null

  if (expand) {
    return (
      <div className="mt-2 flex w-48 flex-col items-center justify-center rounded-lg bg-ob-deep-900 py-2">
        {children}
      </div>
    )
  }

  return (
    <div
      className={`dropdown-menu origin-top-right absolute right-0 mt-2 w-48 rounded-lg bg-ob-deep-900 py-2 shadow-md ${
        hover ? 'hover-mode' : ''
      }`}
      style={{ opacity: 1, pointerEvents: 'auto', transform: 'translateY(0)' }}
    >
      {children}
    </div>
  )
}
