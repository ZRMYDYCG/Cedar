'use client'

import LoadingSkeleton from '@/components/loading-skeleton/loading-skeleton'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'next/navigation'

export default function HeaderLogo() {
  const router = useRouter()
  const themeConfig = useAppStore(s => s.themeConfig)
  const { site, theme } = themeConfig
  const ready = Boolean(site.author)

  return (
    <div
      className="header-logo relative flex transform-gpu cursor-pointer items-center self-stretch transition-transform duration-500 hover:scale-110"
      onClick={() => router.push('/')}
      role="link"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'Enter') router.push('/')
      }}
    >
      <span className="mr-3 flex">
        {ready ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={`logo-image ${theme.profile_shape}`}
            src={site.logo || site.avatar}
            alt="site-logo"
          />
        ) : (
          <LoadingSkeleton width="2rem" height="2rem" circle />
        )}
      </span>
      <div className="flex flex-col justify-center">
        <span className="text-invert flex text-xl font-extrabold leading-tight text-white">
          {ready ? site.author : 'LOADING'}
        </span>
        <span className="text-invert text-[0.45rem] font-extrabold uppercase leading-tight text-white">
          {site.nick || 'BLOG'}
        </span>
      </div>
    </div>
  )
}
