'use client'

import { siteFriends } from '@/data/site-taxonomy'
import { useAppStore } from '@/stores/app'

type FooterLinkGroup = {
  title: string
  links: { title: string; url: string }[]
}

const defaultLinks: FooterLinkGroup[] = [
  {
    title: 'Explore',
    links: [
      { title: 'Archives', url: '/archives' },
      { title: 'Tags', url: '/tags' },
      { title: 'About', url: '/about' }
    ]
  },
  {
    title: 'Friends',
    links: siteFriends.map(item => ({ title: item.nick, url: item.link }))
  }
]

export default function FooterLink({
  links = defaultLinks
}: {
  links?: FooterLinkGroup[]
}) {
  const themeConfig = useAppStore(s => s.themeConfig)
  if (!links.length) return null

  return (
    <div
      id="footer-link"
      className="flex flex-col items-center bg-ob-deep-900 py-8"
    >
      <div
        className="footer-link-divider relative mt-4 mb-8 flex h-1 w-2/3 rounded-full opacity-70 shadow-xl lg:w-2/5"
        style={{ background: themeConfig.theme.header_gradient_css }}
      >
        <div className="footer-link-img-wrapper absolute top-1/2 left-1/2 m-0 box-content h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={`footer-link-avatar h-full w-full ${themeConfig.theme.profile_shape}`}
            src={themeConfig.site.avatar}
            alt="avatar"
          />
        </div>
      </div>
      <div className="flex w-full max-w-[83.333%] flex-row flex-wrap items-start justify-center gap-8 rounded-lg bg-ob-deep-900 px-6 py-6 text-ob-normal md:gap-10 lg:max-w-screen-2xl xl:gap-16">
        {links.map(link => (
          <div
            key={link.title}
            className="flex flex-col items-center md:items-start"
          >
            <h3 className="mb-4 mr-2 font-bold text-ob-dim">{link.title}</h3>
            <ul className="flex flex-col items-center gap-1 md:items-start">
              {link.links.map(sub => (
                <li key={sub.url} className="cursor-pointer">
                  <a href={sub.url} target="_blank" rel="noreferrer">
                    {sub.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
