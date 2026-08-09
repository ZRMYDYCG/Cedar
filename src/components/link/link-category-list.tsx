'use client'

import LinkCard from '@/components/link/link-card'
import MainTitle from '@/components/title/main-title'
import type { FriendLink } from '@/data/site-taxonomy'
import { useTranslations } from 'next-intl'

export default function LinkCategoryList({
  links
}: {
  links: Record<string, FriendLink[]>
}) {
  const t = useTranslations()
  const categories = Object.keys(links).filter(
    category => links[category].length > 0
  )

  if (categories.length === 0) return null

  return (
    <>
      {categories.map(category => (
        <div key={category}>
          <MainTitle
            title={category}
            count={links[category].length}
            margins="mb-2"
            uppercase={false}
          />
          <span className="mb-8 block text-lg text-ob-dim">
            {t(`${category}-desc`)}
          </span>
          <ul
            className={`mb-10 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 ${
              category.includes('vip') ? 'xl:grid-cols-4' : 'xl:grid-cols-5'
            }`}
          >
            {links[category].map(link => (
              <LinkCard
                key={link.link}
                categoryMode
                data={{
                  ...link,
                  description: link.description || link.link,
                  type: link.label
                    ? `settings.${link.label}`
                    : 'settings.links',
                  vip: link.label === 'links-badge-vip'
                }}
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}
