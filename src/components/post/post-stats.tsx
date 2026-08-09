'use client'

import SvgIcon from '@/components/svg-icon/svg-icon'
import { useTranslations } from 'next-intl'

type PostStatsProps = {
  postWordCount?: number | string
  /** Minutes as number, or a preformatted string / em dash. */
  postTimeCount?: number | string
  comments?: boolean
}

export default function PostStats({
  postWordCount,
  postTimeCount,
  comments = true
}: PostStatsProps) {
  const t = useTranslations('settings')

  if (postTimeCount === undefined || postWordCount === undefined) return null

  const timeLabel =
    typeof postTimeCount === 'number'
      ? t('reading-time', { count: postTimeCount })
      : /^\d+$/.test(postTimeCount)
        ? t('reading-time', { count: Number(postTimeCount) })
        : postTimeCount

  return (
    <div className="post-stats">
      <span>
        <SvgIcon
          className="opacity-70"
          iconClass="clock"
          fill="none"
          stroke="white"
          height="1.25em"
          width="1.25em"
        />
        <span className="pl-2 opacity-70">{timeLabel}</span>
      </span>
      <span>
        <SvgIcon
          className="opacity-70"
          iconClass="text"
          fill="none"
          stroke="white"
          height="1.25em"
          width="1.25em"
        />
        <span className="pl-2 opacity-70">{postWordCount}</span>
      </span>
      {comments ? (
        <span>
          <SvgIcon
            className="opacity-70"
            iconClass="quote"
            fill="none"
            stroke="white"
            height="1.25em"
            width="1.25em"
          />
          <span className="pl-2 opacity-70">—</span>
        </span>
      ) : null}
    </div>
  )
}
