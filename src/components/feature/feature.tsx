import HorizontalArticle from '@/components/article-card/horizontal-article'
import type { PostCard } from '@/types/post'
import type { ReactNode } from 'react'

type FeatureProps = {
  data?: PostCard
  children?: ReactNode
}

export default function Feature({ data, children }: FeatureProps) {
  return (
    <div id="feature">
      <HorizontalArticle data={data} />
      {children}
    </div>
  )
}
