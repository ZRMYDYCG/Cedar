'use client'

import PrimaryButton from '@/components/button/primary-button'
import SecondaryButton from '@/components/button/secondary-button'
import EmptyState from '@/components/empty-state/empty-state'
import LinkAvatar from '@/components/link/link-avatar'
import MainTitle from '@/components/title/main-title'
import type { FriendLink } from '@/data/site-taxonomy'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'
import type { CSSProperties } from 'react'

type LinkPair = [FriendLink, FriendLink]

type LinkBoxProps = {
  data?: LinkPair[]
  onApplyClicked?: () => void
}

export default function LinkBox({
  data = [],
  onApplyClicked
}: LinkBoxProps) {
  const t = useTranslations('settings')
  const themeConfig = useAppStore(s => s.themeConfig)
  const gradientBackground = {
    background: themeConfig.theme.header_gradient_css
  } as CSSProperties

  const hasLinks = data.length > 0
  const marquee = hasLinks ? [...data, ...data, ...data] : []

  const randomJump = () => {
    if (!data.length) return
    const pair = data[Math.floor(Math.random() * data.length)]
    const blogger = pair[Math.floor(Math.random() * 2)]
    window.open(blogger.link, '_blank')
  }

  return (
    <div
      className="relative mb-8 flex h-[25rem] w-full rounded-2xl shadow-xl"
      style={gradientBackground}
    >
      <div className="ob-gradient-plate absolute flex items-center justify-center overflow-hidden rounded-xl bg-ob-deep-900 opacity-90 shadow-lg duration-300 hover:shadow-2xl">
        <div className="relative flex h-full w-full overflow-hidden">
          <div className="absolute top-6 left-6 z-10 flex flex-col">
            <div className="hidden text-sm text-ob-dim md:flex">
              {t('links')}
            </div>
            <MainTitle
              title="settings.links-slogan"
              icon="friends"
              textSize="text-3xl"
              paddings="hidden md:flex pb-2"
              margins="mb-0 mt-0"
              uppercase={false}
            />
          </div>
          <div className="absolute top-8 right-8 z-10 flex space-x-3">
            <SecondaryButton
              text={t('links-random-visit')}
              onClick={randomJump}
            />
            <PrimaryButton text={t('links-apply')} onClick={onApplyClicked} />
          </div>
          {hasLinks ? (
            <div className="link-group-wrapper top-0 left-0 flex flex-nowrap pt-28">
              {marquee.map((links, i) => (
                <div
                  key={`${links[0].nick}-${i}`}
                  className="links-group-avatar-pair ml-4 pt-4 pb-7 select-none"
                >
                  <LinkAvatar
                    title={links[0].nick}
                    link={links[0].link}
                    source={links[0].avatar}
                  />
                  <LinkAvatar
                    title={links[1].nick}
                    link={links[1].link}
                    source={links[1].avatar}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center px-8 pt-20">
              <EmptyState
                variant="panel"
                className="!mt-0 max-w-md border-0 bg-transparent"
                title={t('empty-links')}
                description={t('empty-links-hint')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
