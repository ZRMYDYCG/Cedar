'use client'

import LoadingSkeleton from '@/components/loading-skeleton/loading-skeleton'
import type { FriendLink } from '@/data/site-taxonomy'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'

type LinkCardProps = {
  data: FriendLink & {
    description?: string
    type?: string
    vip?: boolean
  }
  categoryMode?: boolean
}

export default function LinkCard({
  data,
  categoryMode = false
}: LinkCardProps) {
  const t = useTranslations()
  const gradient = useAppStore(s => s.themeConfig.theme.header_gradient_css)
  const vip = Boolean(data.vip)

  return (
    <li
      id="link-card"
      className={`article-container ${vip ? 'highlighted' : ''} ${
        categoryMode ? 'category-mode' : ''
      }`}
    >
      <div className="article">
        <div className="article-thumbnail">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.avatar || '/default-cover.jpg'} alt="" />
          <span className="thumbnail-screen" style={{ background: gradient }} />
        </div>
        <div className="article-content">
          <span>
            {data.type ? (
              <b
                className={vip ? 'vip' : undefined}
                style={vip ? { background: gradient } : undefined}
              >
                {t(data.type)}
              </b>
            ) : (
              <LoadingSkeleton height="20px" width="35px" />
            )}
          </span>
          <a href={data.link} target="_blank" rel="noreferrer">
            <h1 className={`text-xl ${vip ? 'vip-text' : ''}`}>{data.nick}</h1>
          </a>
          {data.description ? (
            <p>{data.description}</p>
          ) : (
            <LoadingSkeleton count={2} height="16px" />
          )}
        </div>
      </div>
    </li>
  )
}
