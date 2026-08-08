import SvgIcon from '@/components/svg-icon/svg-icon'
import type { SvgIconName } from '@/components/svg-icon/svg-sprite-data'

type SocialMap = {
  github?: string
  twitter?: string
  stackoverflow?: string
  wechat?: string
  qq?: string
  weibo?: string
  csdn?: string
  zhihu?: string
  [key: string]: string | undefined
}

const iconMap: Record<string, SvgIconName> = {
  github: 'github',
  twitter: 'twitter',
  stackoverflow: 'stackoverflow',
  wechat: 'wechat',
  qq: 'qq',
  weibo: 'weibo',
  csdn: 'csdn',
  zhihu: 'zhifu'
}

export default function Social({ socials }: { socials?: SocialMap }) {
  const entries = Object.entries(socials || {}).filter(([, url]) => Boolean(url))
  if (!entries.length) return null

  return (
    <ul className="flex w-full flex-row flex-wrap items-center justify-evenly px-2 py-4 text-center">
      {entries.map(([name, url]) => (
        <a key={name} href={url} target="_blank" rel="noreferrer">
          <li className="diamond-clip-path diamond-icon">
            {iconMap[name] ? (
              <SvgIcon
                iconClass={iconMap[name]}
                className="fill-current"
                width="1.1rem"
                height="1.1rem"
              />
            ) : (
              name.slice(0, 2)
            )}
          </li>
        </a>
      ))}
    </ul>
  )
}
