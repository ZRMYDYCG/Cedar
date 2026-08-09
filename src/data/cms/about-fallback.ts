import { siteConfig } from '@/config/site-config'
import type { SiteProfileTexts } from '@/data/cms/site-settings'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Default About copy when CMS `pages/about` is missing. */
export function buildAboutFallbackHtml(
  profile: SiteProfileTexts,
  socials: (typeof siteConfig)['socials'] = siteConfig.socials
): string {
  const nick = profile.nick.trim() || profile.author
  const author = profile.author.trim() || nick
  const subtitle = profile.subtitle.trim()
  const github = socials.github?.trim()

  const nameLine =
    nick && author && nick !== author
      ? `你好，我是 <strong>${escapeHtml(nick)}</strong>（${escapeHtml(author)}）。`
      : `你好，我是 <strong>${escapeHtml(nick || author)}</strong>。`

  const parts = [
    `<p>${nameLine}</p>`,
    subtitle ? `<p>${escapeHtml(subtitle)}。</p>` : '',
    '<p>这里是我的个人站点 Cedar：记一点笔记，晒一点朋友圈，把技术与日常慢慢留下。</p>',
    github
      ? `<p>也可以在 <a href="${escapeHtml(github)}" target="_blank" rel="noopener noreferrer">GitHub</a> 找到我。</p>`
      : ''
  ]

  return parts.filter(Boolean).join('\n')
}
