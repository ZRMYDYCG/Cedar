'use client'

import type { ReactNode } from 'react'
import { useDropdown } from './dropdown'

type DropdownItemProps = {
  name: string
  active?: boolean
  onSelect?: (name: string) => void
  children: ReactNode
}

export default function DropdownItem({
  name,
  active,
  onSelect,
  children
}: DropdownItemProps) {
  const { setActive } = useDropdown()

  return (
    <div
      className={`dropdown-item text-invert my-1 block cursor-pointer px-4 py-1 font-medium text-ob-bright hover:bg-ob-trans hover:text-ob-bright ${
        active ? 'active' : ''
      }`}
      onClick={event => {
        event.stopPropagation()
        onSelect?.(name)
        setActive(false)
      }}
    >
      {children}
    </div>
  )
}
