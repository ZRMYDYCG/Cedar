import AboutView from '@/app/(frontend)/about/about-view'
import { getPageBySlug } from '@/data/cms/pages'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const page = await getPageBySlug('about')
  return (
    <AboutView
      title={page?.title}
      html={
        page?.html ||
        '<p>Create and publish the <code>about</code> page in Payload Admin.</p>'
      }
    />
  )
}
