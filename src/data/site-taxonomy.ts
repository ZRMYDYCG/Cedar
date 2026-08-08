/** Friend links — empty until a Links CMS collection exists. */

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
  label?: string
}

export const siteFriends: FriendLink[] = []

export function buildFriendPairs(friends: FriendLink[] = siteFriends) {
  const pairs: [FriendLink, FriendLink][] = []
  const list = friends
  if (!list.length) return pairs
  for (let i = 0; i < 24; i += 1) {
    pairs.push([list[i % list.length], list[(i + 1) % list.length]])
  }
  return pairs
}
