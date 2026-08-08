'use client'

import LinkCard from '@/components/link/link-card'
import SubTitle from '@/components/title/sub-title'
import type { FriendLink } from '@/data/site-taxonomy'

export default function LinkList({ links }: { links: FriendLink[] }) {
  return (
    <div>
      <SubTitle
        title="settings.links"
        icon="friends"
        count={links.length}
        uppercase={false}
      />
      <ul className="grid grid-cols-2 gap-8 md:grid-cols-4 xl:grid-cols-6">
        {links.map(link => (
          <LinkCard
            key={link.link}
            data={{
              ...link,
              description: link.description || link.link,
              type: link.label || 'settings.links'
            }}
          />
        ))}
      </ul>
    </div>
  )
}
