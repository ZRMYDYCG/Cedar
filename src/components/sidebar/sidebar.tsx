'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

export default function Sidebar({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (isMobile) return null
  return <div>{children}</div>
}
