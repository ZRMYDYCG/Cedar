'use client'

import MainTitle from '@/components/title/main-title'
import {
  createComment,
  groupComments,
  type CommentCard,
  type CommentTargetKind
} from '@/data/cms/comments-shared'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'

type CommentProps = {
  title?: string
  body?: string
  uid?: string
  targetKind?: CommentTargetKind
}

function formatTime(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function CommentItem({
  comment,
  replies,
  onReply,
  locale,
  t
}: {
  comment: CommentCard
  replies: CommentCard[]
  onReply?: (comment: CommentCard) => void
  locale: string
  t: ReturnType<typeof useTranslations<'comments'>>
}) {
  const safeUrl =
    comment.authorUrl && /^https?:\/\//i.test(comment.authorUrl)
      ? comment.authorUrl
      : null

  return (
    <li className="cedar-comment-card">
      <div className="cedar-comment-meta">
        {safeUrl ? (
          <a
            className="cedar-comment-name"
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {comment.authorName}
          </a>
        ) : (
          <span className="cedar-comment-name">{comment.authorName}</span>
        )}
        {comment.isAdmin ? (
          <span className="cedar-comment-badge">{t('admin-badge')}</span>
        ) : null}
        <time dateTime={comment.createdAt}>
          {formatTime(comment.createdAt, locale)}
        </time>
      </div>
      <p className="cedar-comment-body">{comment.content}</p>
      {onReply ? (
        <button
          type="button"
          className="cedar-comment-reply-btn"
          onClick={() => onReply(comment)}
        >
          {t('reply')}
        </button>
      ) : null}
      {replies.length > 0 ? (
        <ul className="cedar-comment-replies">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={[]}
              locale={locale}
              t={t}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export default function Comment({
  uid,
  targetKind = 'post'
}: CommentProps) {
  const t = useTranslations('comments')
  const shape = useAppStore(s => s.themeConfig.theme.profile_shape)
  const locale = useAppStore(s => s.locale) || 'zh-CN'

  const [comments, setComments] = useState<CommentCard[]>([])
  const [loading, setLoading] = useState(Boolean(uid))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<CommentCard | null>(null)

  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [authorUrl, setAuthorUrl] = useState('')
  const [content, setContent] = useState('')
  const [company, setCompany] = useState('')

  const load = useCallback(async () => {
    if (!uid) {
      setComments([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams({
        'where[target][equals]': uid,
        sort: 'createdAt',
        limit: '100',
        depth: '1'
      })
      const res = await fetch(`/api/comments?${params}`, {
        headers: { Accept: 'application/json' }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { docs?: CommentCard[] & unknown[] }
      const docs = (data.docs || []) as Array<{
        id: number
        target: string
        targetKind?: CommentTargetKind
        content: string
        authorName: string
        authorUrl?: string | null
        author?: unknown
        parent?: number | { id: number } | null
        createdAt: string
      }>
      setComments(
        docs.map(doc => ({
          id: doc.id,
          target: doc.target,
          targetKind: doc.targetKind || targetKind,
          content: doc.content,
          authorName: doc.authorName,
          authorUrl: doc.authorUrl,
          isAdmin: Boolean(doc.author),
          parentId:
            typeof doc.parent === 'object' && doc.parent
              ? doc.parent.id
              : typeof doc.parent === 'number'
                ? doc.parent
                : null,
          createdAt: doc.createdAt
        }))
      )
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [uid, targetKind])

  useEffect(() => {
    void load()
  }, [load])

  const { roots, repliesByParent } = useMemo(
    () => groupComments(comments),
    [comments]
  )

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!uid || submitting) return
    setError(null)
    setSubmitting(true)
    try {
      const created = await createComment({
        target: uid,
        targetKind,
        content,
        authorName,
        authorEmail,
        authorUrl,
        parent: replyTo?.id,
        company
      })
      if (created === null) {
        // Honeypot — pretend success.
        setContent('')
        setReplyTo(null)
        return
      }
      setContent('')
      setReplyTo(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error-generic'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!uid) {
    return (
      <div
        className={`comment-${shape} mt-8 bg-ob-deep-800 p-4 lg:px-14 lg:py-10`}
      >
        <MainTitle
          title="titles.comment"
          icon="quote"
          paddings="pb-2 pt-0"
          textSize="text-2xl md:text-3xl"
        />
        <p className="mt-4 text-sm text-ob-dim">{t('missing-target')}</p>
      </div>
    )
  }

  return (
    <div
      className={`comment-${shape} cedar-comments mt-8 bg-ob-deep-800 p-4 lg:px-14 lg:py-10`}
    >
      <MainTitle
        title="titles.comment"
        icon="quote"
        paddings="pb-2 pt-0"
        textSize="text-2xl md:text-3xl"
      />

      <form className="cedar-comment-form mt-6" onSubmit={onSubmit}>
        {replyTo ? (
          <div className="cedar-comment-replying">
            <span>
              {t('replying-to', { name: replyTo.authorName })}
            </span>
            <button type="button" onClick={() => setReplyTo(null)}>
              {t('cancel-reply')}
            </button>
          </div>
        ) : null}

        <div className="cedar-comment-fields">
          <input
            required
            maxLength={40}
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
            placeholder={t('placeholder-name')}
            aria-label={t('placeholder-name')}
          />
          <input
            type="email"
            maxLength={120}
            value={authorEmail}
            onChange={e => setAuthorEmail(e.target.value)}
            placeholder={t('placeholder-email')}
            aria-label={t('placeholder-email')}
          />
          <input
            type="url"
            maxLength={200}
            value={authorUrl}
            onChange={e => setAuthorUrl(e.target.value)}
            placeholder={t('placeholder-url')}
            aria-label={t('placeholder-url')}
          />
        </div>

        {/* Honeypot — hidden from humans */}
        <label className="cedar-comment-hp" aria-hidden="true">
          <span>Company</span>
          <input
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={e => setCompany(e.target.value)}
          />
        </label>

        <textarea
          required
          maxLength={2000}
          rows={4}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={t('placeholder-content')}
          aria-label={t('placeholder-content')}
        />

        {error ? <p className="cedar-comment-error">{error}</p> : null}

        <button type="submit" className="cedar-comment-submit" disabled={submitting}>
          {submitting ? t('submitting') : t('submit')}
        </button>
      </form>

      <div className="cedar-comment-list mt-8">
        {loading ? (
          <p className="text-sm text-ob-dim">{t('loading')}</p>
        ) : roots.length === 0 ? (
          <p className="text-sm text-ob-dim">{t('empty')}</p>
        ) : (
          <ul className="cedar-comment-roots">
            {roots.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={repliesByParent[comment.id] || []}
                onReply={setReplyTo}
                locale={locale}
                t={t}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
