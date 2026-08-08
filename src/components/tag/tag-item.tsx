'use client'

import { useAppStore } from '@/stores/app'
import Link from 'next/link'

type TagItemProps = {
  name: string
  slug: string
  count?: number
  size?: 'small' | 'large'
  active?: boolean
}

export default function TagItem({
  name,
  slug,
  count = 0,
  size = 'small',
  active = false
}: TagItemProps) {
  const gradient = useAppStore(s => s.themeConfig.theme.header_gradient_css)

  return (
    <div className="mb-1 mr-1 flex cursor-pointer flex-row items-center transition-all">
      <Link
        href={`/post/search?tag=${slug}`}
        className={
          size === 'large'
            ? 'large-tag-item flex rounded-md bg-ob-deep-900 px-4 py-2 text-base text-ob-bright hover:opacity-100'
            : 'flex rounded-md p-1.5 text-sm font-bold hover:bg-ob-deep-900 hover:text-ob-bright hover:opacity-100'
        }
        style={
          active
            ? { background: gradient, color: '#fff', opacity: 1 }
            : undefined
        }
      >
        {name}
        <sub
          className={
            size === 'large'
              ? '-mt-1.5 ml-2 block rounded-full text-xs text-ob'
              : '-mt-1.5 ml-1 block text-xs opacity-50'
          }
        >
          {count}
        </sub>
      </Link>
    </div>
  )
}
