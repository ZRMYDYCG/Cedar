import JoysView from '@/app/(frontend)/joys/joys-view'
import { getPublishedJoys } from '@/data/cms/joys'

export const dynamic = 'force-dynamic'

export default async function JoysPage() {
  const joys = await getPublishedJoys()
  return <JoysView joys={joys} />
}
