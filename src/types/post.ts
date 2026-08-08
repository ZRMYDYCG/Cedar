export type PostDate = {
  month: string
  day: number
  year: number
}

export type PostTaxonomy = {
  name: string
  slug: string
}

export type PostAuthor = {
  name: string
  avatar: string
  link: string
  slug?: string
}

export type PostCard = {
  title?: string
  slug?: string
  cover?: string
  text?: string
  excerpt?: string
  pinned?: boolean
  feature?: boolean
  categories?: PostTaxonomy[]
  tags?: PostTaxonomy[]
  min_tags?: PostTaxonomy[]
  author?: PostAuthor
  date?: PostDate
  count_time?: {
    symbolsTime?: string
    symbolsCount?: number
  }
}
