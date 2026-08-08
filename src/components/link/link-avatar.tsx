'use client'

import LoadingSkeleton from '@/components/loading-skeleton/loading-skeleton'
import { useAppStore } from '@/stores/app'

type LinkAvatarProps = {
  title?: string
  link?: string
  source?: string
}

export default function LinkAvatar({ title, link, source }: LinkAvatarProps) {
  const shape = useAppStore(s => s.themeConfig.theme.profile_shape)
  const diamond = shape === 'diamond-avatar'

  return (
    <a
      className={`links-group-avatar flex h-[120px] w-[120px] items-center justify-center text-6xl font-bold text-white ${
        diamond ? 'diamond-shape' : ''
      }`}
      href={link || '#'}
      target="_blank"
      rel="noreferrer"
      title={title}
    >
      {source ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={`m-0 h-full w-full transform-gpu shadow-xl ${shape} ${
            diamond ? 'scale-[1.15]' : ''
          }`}
          src={source}
          alt="link-avatar"
          title={title}
        />
      ) : (
        <LoadingSkeleton
          className={`h-full w-full ${shape}`}
          width="100%"
          height="100%"
          circle
        />
      )}
    </a>
  )
}
