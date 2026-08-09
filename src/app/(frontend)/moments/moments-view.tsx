'use client'

import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs'
import EmptyState from '@/components/empty-state/empty-state'
import type { MomentCard } from '@/data/cms/moments'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

type MomentsViewProps = {
  moments: MomentCard[]
}

type PreviewState = {
  urls: string[]
  index: number
}

function formatMomentTime(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const now = Date.now()
  const diff = now - date.getTime()
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function gridClass(count: number) {
  return `moment-grid is-${Math.min(Math.max(count, 1), 9)}`
}

export default function MomentsView({ moments }: MomentsViewProps) {
  const t = useTranslations('settings')
  const resetHeaderImage = useAppStore(s => s.resetHeaderImage)
  const themeConfig = useAppStore(s => s.themeConfig)
  const [preview, setPreview] = useState<PreviewState | null>(null)

  const authorName = themeConfig.site.nick || themeConfig.site.author || 'Me'
  const authorAvatar = themeConfig.site.avatar || '/images/avatar.jpg'
  const authorSignature = themeConfig.site.subtitle || ''
  const coverSrc = '/images/moments-cover.png'

  // Cover lives in-page (图一); keep site banner as pure gradient
  useEffect(() => {
    resetHeaderImage()
    return () => resetHeaderImage()
  }, [resetHeaderImage])

  useEffect(() => {
    if (!preview) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreview(null)
        return
      }
      if (event.key === 'ArrowLeft') {
        setPreview(current => {
          if (!current || current.urls.length < 2) return current
          return {
            ...current,
            index: (current.index - 1 + current.urls.length) % current.urls.length
          }
        })
      }
      if (event.key === 'ArrowRight') {
        setPreview(current => {
          if (!current || current.urls.length < 2) return current
          return {
            ...current,
            index: (current.index + 1) % current.urls.length
          }
        })
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [preview])

  const title = useMemo(() => '朋友圈', [])

  const openPreview = (urls: string[], index: number) => {
    setPreview({ urls, index })
  }

  const shiftPreview = (delta: number) => {
    setPreview(current => {
      if (!current || current.urls.length < 2) return current
      return {
        ...current,
        index: (current.index + delta + current.urls.length) % current.urls.length
      }
    })
  }

  return (
    <div className="mt-20">
      <Breadcrumbs current={title} />

      <div className="moments-shell">
        {/*
          Hero owns cover + overhang band so the avatar is never clipped by
          site banners / parent overflow (matches WeChat Moments prototype).
        */}
        <section className="moments-hero" aria-label="朋友圈封面">
          <div className="moments-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="moments-cover-photo" src={coverSrc} alt="" />
            <div className="moments-cover-shade" />
          </div>

          <div className="moments-meta">
            <div className="moments-cover-identity">
              <div className="moments-cover-name">{authorName}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="moments-cover-avatar"
                src={authorAvatar}
                alt={authorName}
              />
            </div>
            {authorSignature ? (
              <p className="moments-signature">{authorSignature}</p>
            ) : null}
          </div>
        </section>

        {moments.length === 0 ? (
          <EmptyState
            variant="panel"
            title={t('empty-moments')}
            description={t('empty-moments-hint')}
          />
        ) : (
          <div className="moments-feed">
            {moments.map(moment => {
              const imageUrls = moment.images.map(image => image.url)

              return (
                <article key={moment.id} className="moment-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="moment-avatar"
                    src={moment.author.avatar}
                    alt={moment.author.name}
                  />
                  <div className="moment-main">
                    <div className="moment-nick">{moment.author.name}</div>
                    {moment.content ? (
                      <p className="moment-text">{moment.content}</p>
                    ) : null}

                    {moment.images.length > 0 ? (
                      <div className={gridClass(moment.images.length)}>
                        {moment.images.map((image, index) => (
                          <button
                            key={String(image.id)}
                            type="button"
                            className="moment-cell"
                            onClick={() => openPreview(imageUrls, index)}
                            aria-label={`查看第 ${index + 1} 张图片`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={image.url} alt={image.alt || ''} />
                          </button>
                        ))}
                      </div>
                    ) : null}

                    <div className="moment-foot">
                      <time dateTime={moment.publishedAt || undefined}>
                        {formatMomentTime(moment.publishedAt)}
                      </time>
                      {moment.location ? (
                        <span className="moment-place">{moment.location}</span>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {preview ? (
        <div
          className="moment-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="图片预览"
        >
          <div className="moment-lightbox-top">
            <button
              type="button"
              className="moment-lightbox-close"
              onClick={() => setPreview(null)}
            >
              关闭
            </button>
          </div>
          <div
            className="moment-lightbox-stage"
            onClick={() => setPreview(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.urls[preview.index]}
              alt=""
              onClick={event => event.stopPropagation()}
            />
          </div>
          <div className="moment-lightbox-bottom">
            {preview.urls.length > 1 ? (
              <>
                <button
                  type="button"
                  className="moment-lightbox-nav"
                  onClick={() => shiftPreview(-1)}
                >
                  上一张
                </button>
                <span>
                  {preview.index + 1} / {preview.urls.length}
                </span>
                <button
                  type="button"
                  className="moment-lightbox-nav"
                  onClick={() => shiftPreview(1)}
                >
                  下一张
                </button>
              </>
            ) : (
              <span>点击空白处关闭</span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
