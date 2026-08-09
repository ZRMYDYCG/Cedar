'use client'

import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'

export default function SiteFooter() {
  const t = useTranslations('footer')
  const themeConfig = useAppStore(s => s.themeConfig)
  const year = new Date().getFullYear()
  const name = themeConfig.site.nick || themeConfig.site.author || 'Cedar'
  const avatar = themeConfig.site.avatar || '/images/avatar.jpg'

  return (
    <footer className="site-footer" aria-label={t('label')}>
      <div className="site-footer-mark">
        <div className="site-footer-rule" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={`site-footer-avatar ${themeConfig.theme.profile_shape}`}
          src={avatar}
          alt=""
        />
      </div>
      <p className="site-footer-line">
        <span className="site-footer-name">{name}</span>
        <span className="site-footer-dot" aria-hidden="true">
          ·
        </span>
        <span>{t('tagline')}</span>
        <span className="site-footer-year">{year}</span>
      </p>
    </footer>
  )
}
