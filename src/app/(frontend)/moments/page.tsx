import MomentsView from '@/app/(frontend)/moments/moments-view'
import { getPublishedMoments } from '@/data/cms/moments'

export const dynamic = 'force-dynamic'

export default async function MomentsPage() {
  const moments = await getPublishedMoments()
  return <MomentsView moments={moments} />
}
