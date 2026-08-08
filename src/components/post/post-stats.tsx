'use client'

import SvgIcon from '@/components/svg-icon/svg-icon'

type PostStatsProps = {
  postWordCount?: number | string
  postTimeCount?: string
  comments?: boolean
}

export default function PostStats({
  postWordCount,
  postTimeCount,
  comments = true
}: PostStatsProps) {
  if (postTimeCount === undefined || postWordCount === undefined) return null

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
        <span className="pl-2 opacity-70">{postTimeCount}</span>
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
