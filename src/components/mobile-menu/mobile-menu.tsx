'use client'

import Social from '@/components/social/social'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MobileMenu() {
  const open = useAppStore(s => s.mobileMenuOpen)
  const toggle = useAppStore(s => s.toggleMobileMenu)
  const themeConfig = useAppStore(s => s.themeConfig)
  const locale = useAppStore(s => s.locale)
  const router = useRouter()
  const t = useTranslations('settings')

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  const pushPage = (path: string) => {
    if (!path) return
    toggle(false)
    if (/^https?:\/\//.test(path)) {
      window.location.href = path
      return
    }
    router.push(path)
  }

  return (
    <div className="App-Mobile-sidebar lg:hidden">
      <div
        id="App-Mobile-Profile"
        className={`App-Mobile-wrapper ${open ? 'open-menu' : ''}`}
      >
        <div className="flex flex-col items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`ob-avatar ${themeConfig.theme.profile_shape}`}
            src={themeConfig.site.avatar}
            alt="avatar"
          />
          <h2 className="pt-4 text-center text-4xl font-semibold text-ob-bright">
            {themeConfig.site.author}
          </h2>
          <span
            className="mt-2 h-1 w-14 rounded-full"
            style={{ background: themeConfig.theme.header_gradient_css }}
          />
          <p className="w-full px-2 pt-6 text-center text-sm text-ob-normal">
            {themeConfig.site.subtitle}
          </p>
          <Social socials={themeConfig.socials} />
          <ul className="grid w-full grid-cols-3 px-2 pt-4 text-lg">
            <li className="col-span-1 text-center">
              <span className="text-ob-bright">12</span>
              <p className="text-base text-ob-dim">{t('articles')}</p>
            </li>
            <li className="col-span-1 text-center">
              <span className="text-ob-bright">5</span>
              <p className="text-base text-ob-dim">{t('categories')}</p>
            </li>
            <li className="col-span-1 text-center">
              <span className="text-ob-bright">18</span>
              <p className="text-base text-ob-dim">{t('tags')}</p>
            </li>
          </ul>
        </div>
        <ul className="mt-8 flex w-full list-none flex-col items-center justify-center text-ob-bright">
          {themeConfig.menu.menus.map(route => (
            <li key={route.path} className="cursor-pointer pb-2">
              <div
                className="relative block rounded-md px-1.5 py-0.5 text-sm uppercase"
                onClick={() => pushPage(route.path)}
              >
                <span className="relative z-50">
                  {route.i18n[locale] || route.name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div
        className={`App-Mobile-blur ${open ? 'visible' : ''}`}
        onClick={() => toggle(false)}
      />
    </div>
  )
}
