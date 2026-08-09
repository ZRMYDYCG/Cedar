'use client'

import Dia from '@/components/dia/dia'
import SiteFooter from '@/components/footer/site-footer'
import HeaderMain from '@/components/header/header-main'
import MobileMenu from '@/components/mobile-menu/mobile-menu'
import ProgressBar from '@/components/progress-bar/progress-bar'
import SearchModal from '@/components/search-modal/search-modal'
import SvgSprite from '@/components/svg-icon/svg-sprite'
import type { SiteConfig } from '@/config/site-config'
import { useAppStore } from '@/stores/app'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
  /** Server-resolved config (CMS profile texts + code defaults). */
  siteConfigFromCms?: SiteConfig
}

export default function AppShell({
  children,
  siteConfigFromCms
}: AppShellProps) {
  const theme = useAppStore(s => s.theme)
  const themeConfig = useAppStore(s => s.themeConfig)
  const headerImage = useAppStore(s => s.headerImage)
  const setTheme = useAppStore(s => s.setTheme)
  const hydrated = useRef(false)

  // Sync CMS profile before paint to avoid nick/signature flash.
  if (siteConfigFromCms && !hydrated.current) {
    useAppStore.setState({ themeConfig: siteConfigFromCms, configReady: true })
    hydrated.current = true
  }

  useEffect(() => {
    if (siteConfigFromCms) {
      useAppStore.getState().setThemeConfig(siteConfigFromCms)
    }
  }, [siteConfigFromCms])

  useEffect(() => {
    const cookieTheme = document.cookie
      .split('; ')
      .find(row => row.startsWith('theme='))
      ?.split('=')[1] as 'theme-dark' | 'theme-light' | undefined

    if (cookieTheme === 'theme-dark' || cookieTheme === 'theme-light') {
      setTheme(cookieTheme)
      return
    }

    // Vue initializeTheme: only apply config dark_mode when no cookie
    // (and dark_mode !== 'auto'). Match system already handled by FOUC script.
    const darkMode = themeConfig.theme.dark_mode
    if (darkMode === true || darkMode === false) {
      setTheme(darkMode ? 'theme-dark' : 'theme-light')
    }
  }, [setTheme, themeConfig.theme.dark_mode])

  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark')
    document.documentElement.classList.add(theme)
    document.body.classList.remove('theme-light', 'theme-dark')
    document.body.classList.add(theme)
  }, [theme])

  const gradient = themeConfig.theme.gradient
  const cssVariables = {
    ...(theme === 'theme-dark'
      ? {
          '--text-accent': gradient.color_1,
          '--text-sub-accent': gradient.color_3,
          '--main-gradient': themeConfig.theme.header_gradient_css
        }
      : {
          '--text-accent': gradient.color_3,
          '--text-sub-accent': gradient.color_2,
          '--main-gradient': themeConfig.theme.header_gradient_css
        })
  } as CSSProperties

  const hasHeaderImage = Boolean(headerImage)

  return (
    <>
      {/* Vue: #App-Wrapper.app-wrapper.theme-* ; footer siblings sit on body bg-alt */}
      <div
        id="App-Wrapper"
        className={`app-wrapper ${theme}`}
        style={{ minHeight: '100vh', ...cssVariables }}
      >
        <SvgSprite />
        {/*
          Banners on the wrapper (not the max-width container) so the gradient
          covers the full upper viewport — including behind the transparent header.
        */}
        <div className="app-banner bg-ob-screen" />
        <div
          className="app-banner app-banner-image"
          style={{
            backgroundImage: hasHeaderImage
              ? `url(${headerImage}), url(/default-cover.jpg)`
              : undefined,
            backgroundColor: '#051208',
            opacity: hasHeaderImage ? 0.2 : 0
          }}
        />
        <div
          className="app-banner app-banner-screen"
          style={{
            background: themeConfig.theme.header_gradient_css,
            opacity: hasHeaderImage ? 0.8 : 0.99
          }}
        />
        <div className="app-banner app-banner-cover" />
        <HeaderMain />
        <div
          id="App-Container"
          className="app-container px-3 lg:max-w-screen-2xl lg:px-8"
          tabIndex={-1}
          style={cssVariables}
          onKeyDown={event => {
            if (
              event.key.toLowerCase() === 'k' &&
              (event.metaKey || event.ctrlKey)
            ) {
              event.preventDefault()
              useAppStore.getState().setSearchModalOpen(true)
            }
          }}
        >
          <div className="relative z-10">{children}</div>
        </div>
        {/* Inside wrapper so body alt-bg does not show a dark strip above footer */}
        <SiteFooter />
      </div>

      <MobileMenu />
      <SearchModal />
      <Dia />
      <ProgressBar />
    </>
  )
}
