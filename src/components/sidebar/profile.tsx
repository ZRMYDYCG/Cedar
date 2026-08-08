'use client'

import LoadingSkeleton from '@/components/loading-skeleton/loading-skeleton'
import Social from '@/components/social/social'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'

type ProfileStats = {
  word_count?: number
  post_count?: number
  categories?: number
  tags?: number
}

export default function Profile({ stats }: { stats?: ProfileStats }) {
  const t = useTranslations('settings')
  const themeConfig = useAppStore(s => s.themeConfig)
  const gradient = themeConfig.theme.header_gradient_css

  const authorData = {
    name: themeConfig.site.author,
    avatar: themeConfig.site.avatar,
    description: themeConfig.site.subtitle,
    socials: themeConfig.socials,
    word_count: stats?.word_count ?? 0,
    post_count: stats?.post_count ?? 0,
    categories: stats?.categories ?? 0,
    tags: stats?.tags ?? 0
  }

  return (
    <div
      className="relative mb-8 h-98 w-full rounded-2xl shadow-xl"
      style={{ background: gradient }}
    >
      <div
        className="ob-gradient-cut-plate absolute flex items-center justify-center rounded-xl bg-ob-deep-900 px-6 pt-4 opacity-90 shadow-lg duration-300 hover:shadow-2xl"
        data-dia="author"
      >
        <div className="profile absolute flex w-full flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            {authorData.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={`ob-avatar ${themeConfig.theme.profile_shape}`}
                src={authorData.avatar}
                alt="avatar"
              />
            ) : (
              <LoadingSkeleton width="6.4rem" height="6.4rem" circle />
            )}
            <h2 className="pt-2 text-center text-3xl font-semibold text-ob-bright">
              {authorData.name || (
                <LoadingSkeleton height="2.25rem" width="7rem" />
              )}
            </h2>
            <span
              className="mt-2 h-1 w-14 rounded-full"
              style={{ background: gradient }}
            />
          </div>
          <div className="flex h-full w-full flex-1 flex-col items-end justify-center">
            {authorData.description ? (
              <p className="w-full flex-1 px-8 pt-6 text-center text-sm leading-8">
                {authorData.description}
              </p>
            ) : (
              <p className="flex w-full flex-col justify-center gap-2 px-8 pt-8 text-center text-sm">
                <LoadingSkeleton height="20px" width="100%" />
                <LoadingSkeleton height="20px" width="100%" />
              </p>
            )}
            <Social socials={authorData.socials} />
            <ul className="grid w-full grid-cols-4 px-2 pt-2 text-lg">
              <li className="col-span-1 text-center">
                <span className="text-ob-bright">{authorData.word_count}</span>
                <p className="text-xs">{t('words')}</p>
              </li>
              <li className="col-span-1 text-center">
                <span className="text-ob-bright">{authorData.post_count}</span>
                <p className="text-xs">{t('articles')}</p>
              </li>
              <li className="col-span-1 text-center">
                <span className="text-ob-bright">{authorData.categories}</span>
                <p className="text-xs">{t('categories')}</p>
              </li>
              <li className="col-span-1 text-center">
                <span className="text-ob-bright">{authorData.tags}</span>
                <p className="text-xs">{t('tags')}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
