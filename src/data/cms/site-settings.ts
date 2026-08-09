import { siteConfig, type SiteConfig } from '@/config/site-config'
import { safeCms } from '@/data/cms/safe'
import { getPayloadClient } from '@/lib/payload'

export type SiteProfileTexts = {
  author: string
  nick: string
  subtitle: string
}

const defaults: SiteProfileTexts = {
  author: siteConfig.site.author,
  nick: siteConfig.site.nick,
  subtitle: siteConfig.site.subtitle
}

function pickText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

export async function getSiteProfileTexts(): Promise<SiteProfileTexts> {
  return safeCms(
    'getSiteProfileTexts',
    async () => {
      const payload = await getPayloadClient()
      const doc = await payload.findGlobal({
        slug: 'site-settings',
        depth: 0,
        overrideAccess: false
      })
      return {
        author: pickText(doc.author, defaults.author),
        nick: pickText(doc.nick, defaults.nick),
        subtitle: pickText(doc.subtitle, defaults.subtitle)
      }
    },
    defaults
  )
}

/** Full theme/site config with CMS profile texts overlaid. */
export async function getResolvedSiteConfig(): Promise<SiteConfig> {
  const texts = await getSiteProfileTexts()
  return {
    ...siteConfig,
    site: {
      ...siteConfig.site,
      ...texts
    }
  }
}
