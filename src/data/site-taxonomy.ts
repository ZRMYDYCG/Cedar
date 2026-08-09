import { siteFriends as seededFriends } from '@/data/site-friends'

export type TaxonomyItem = {
  name: string
  slug: string
  count: number
}

export type FriendLink = {
  nick: string
  link: string
  avatar?: string
  description?: string
  /** settings i18n key suffix, e.g. links-badge-tech */
  label?: string
}

export { seededFriends as siteFriends }

export function buildFriendPairs(friends: FriendLink[] = seededFriends) {
  const pairs: [FriendLink, FriendLink][] = []
  const list = friends
  if (!list.length) return pairs
  for (let i = 0; i < 24; i += 1) {
    pairs.push([list[i % list.length], list[(i + 1) % list.length]])
  }
  return pairs
}

/** Group friend links by badge label for the /links category grid. */
export function groupFriendsByLabel(
  friends: FriendLink[] = seededFriends
): Record<string, FriendLink[]> {
  const order = [
    'links-badge-tech',
    'links-badge-personal',
    'links-badge-designer',
    'links-badge-vip'
  ] as const

  const grouped: Record<string, FriendLink[]> = {}
  for (const key of order) grouped[`settings.${key}`] = []

  for (const friend of friends) {
    const key = friend.label
      ? `settings.${friend.label}`
      : 'settings.links-badge-tech'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(friend)
  }

  return grouped
}
