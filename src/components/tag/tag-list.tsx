import type { ReactNode } from 'react'

export default function TagList({
  className = '',
  children
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={`flex flex-wrap pt-2 ${className}`}>{children}</div>
}
