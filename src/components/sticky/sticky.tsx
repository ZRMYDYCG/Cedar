'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

type StickyProps = {
  stickyTop?: number
  zIndex?: number
  children: ReactNode
  onActiveChange?: (active: boolean) => void
}

export default function Sticky({
  stickyTop = 0,
  zIndex = 1,
  children,
  onActiveChange
}: StickyProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    setHeight(el.getBoundingClientRect().height)

    const onScroll = () => {
      const top = el.getBoundingClientRect().top
      const next = top <= stickyTop
      setActive(next)
      onActiveChange?.(next)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [stickyTop, onActiveChange])

  return (
    <div id="sticky" style={{ height, zIndex }} ref={ref}>
      <div
        style={{
          position: active ? 'fixed' : 'relative',
          top: active ? stickyTop : undefined,
          zIndex,
          width: active && ref.current ? ref.current.offsetWidth : undefined
        }}
      >
        {children}
      </div>
    </div>
  )
}
