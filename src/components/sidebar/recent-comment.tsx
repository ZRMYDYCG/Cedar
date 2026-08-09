'use client'

import EmptyState from '@/components/empty-state/empty-state'
import SubTitle from '@/components/title/sub-title'
import {
  commentHref,
  type CommentCard
} from '@/data/cms/comments-shared'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type RecentCommentProps = {
  comments?: CommentCard[]
}

export default function RecentComment({ comments = [] }: RecentCommentProps) {
  const t = useTranslations('settings')
  const tComments = useTranslations('comments')

  return (
    <div className="sidebar-box mb-8">
      <SubTitle title="titles.recent_comment" icon="quote" />
      {comments.length === 0 ? (
        <EmptyState variant="inline" title={t('empty-recent-comments')} />
      ) : (
        <ul className="cedar-recent-comments">
          {comments.map(comment => (
            <li key={comment.id}>
              <Link href={`${commentHref(comment)}#comments`}>
                <strong>{comment.authorName}</strong>
                {comment.isAdmin ? (
                  <span className="cedar-comment-badge">
                    {tComments('admin-badge')}
                  </span>
                ) : null}
                <p>
                  {comment.content.length > 48
                    ? `${comment.content.slice(0, 48)}…`
                    : comment.content}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
