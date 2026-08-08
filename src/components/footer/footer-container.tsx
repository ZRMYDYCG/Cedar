'use client'

import SvgIcon from '@/components/svg-icon/svg-icon'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'

export default function FooterContainer() {
  const t = useTranslations('settings')
  const themeConfig = useAppStore(s => s.themeConfig)
  const year = new Date().getUTCFullYear()

  return (
    <div
      id="footer"
      className="relative w-full pt-1"
      style={{ background: themeConfig.theme.header_gradient_css }}
    >
      <span className="flex justify-center bg-ob-deep-800">
        <div className="grid w-full max-w-[83.333%] grid-rows-1 items-center justify-center gap-8 rounded-lg bg-ob-deep-800 px-6 py-6 text-sm text-ob-normal lg:max-w-screen-2xl lg:grid-cols-4 lg:grid-rows-none">
          <div className="row-span-1 flex flex-col gap-6 text-center lg:col-span-3 lg:flex-row lg:gap-12 lg:text-left">
            <ul className="flex flex-col gap-1.5">
              <li>
                Copyright © 2019 - {year}{' '}
                <b className="font-extrabold">{themeConfig.site.author}</b>. All
                Rights Reserved.
              </li>
              <li>
                Powered by{' '}
                <a href="https://nextjs.org/">
                  <b className="border-b-2 border-ob font-extrabold hover:text-ob">
                    Next.js
                  </b>
                </a>{' '}
                & Site{' '}
                <b className="border-b-2 border-ob font-extrabold hover:text-ob">
                  Cedar
                </b>
              </li>
              <li className="flex max-w-[11rem] flex-row">
                <span>
                  <SvgIcon
                    iconClass="hot"
                    className="mr-1 inline-block text-lg"
                    stroke="currentColor"
                  />
                  {t('page-views-value')}
                </span>
                <span className="flex-1 text-right">—</span>
              </li>
            </ul>
          </div>
          <div className="relative row-span-1 hidden justify-center lg:col-span-1 lg:flex lg:justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={`footer-avatar ${themeConfig.theme.profile_shape}`}
              src={themeConfig.site.avatar}
              alt="avatar"
            />
          </div>
        </div>
      </span>
    </div>
  )
}
