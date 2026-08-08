'use client'

import { useAppStore } from '@/stores/app'
import { useEffect, useState } from 'react'
import HeaderControls from './header-controls'
import HeaderLogo from './header-logo'
import HeaderNavigation from './header-navigation'
import HeaderNotification from './header-notification'

export default function HeaderMain() {
  const [active, setActive] = useState(false)
  const scrollProgress = useAppStore(s => s.scrollProgress)
  const setScrollProgress = useAppStore(s => s.setScrollProgress)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress =
        max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0
      setActive(window.scrollY > 24)
      setScrollProgress(progress)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [setScrollProgress])

  return (
    <div
      className={`header-container sticky top-0 z-[999] ${
        active ? 'header-active' : ''
      }`}
    >
      <header className="site-header mx-auto max-w-screen-2xl px-3 lg:px-8">
        <HeaderLogo />
        <HeaderNavigation />
        <HeaderControls scrollProgress={scrollProgress} />
        <HeaderNotification />
      </header>
    </div>
  )
}
