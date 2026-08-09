import AboutView from '@/app/(frontend)/about/about-view'
import { buildAboutFallbackHtml } from '@/data/cms/about-fallback'
import { getPageBySlug } from '@/data/cms/pages'
import { getResolvedSiteConfig } from '@/data/cms/site-settings'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const [page, config] = await Promise.all([
    getPageBySlug('about'),
    getResolvedSiteConfig()
  ])

  return (
    <AboutView
      title={page?.title || '关于'}
      html={
        page?.html ||
        buildAboutFallbackHtml(
          {
            author: config.site.author,
            nick: config.site.nick,
            subtitle: config.site.subtitle
          },
          config.socials
        )
      }
    />
  )
}
