'use client'

import LoadingSkeleton from '@/components/loading-skeleton/loading-skeleton'
import SvgIcon from '@/components/svg-icon/svg-icon'
import { encodePathSegment } from '@/lib/path-segment'
import { useAppStore } from '@/stores/app'
import type { PostCard } from '@/types/post'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

type ArticleCardProps = {
  data: PostCard
}

export default function ArticleCard({ data: post }: ArticleCardProps) {
  const t = useTranslations()
  const router = useRouter()
  const themeConfig = useAppStore(s => s.themeConfig)
  const shape = themeConfig.theme.profile_shape

  const goPost = (slug?: string) => {
    if (!slug) return
    router.push(`/post/${encodePathSegment(slug)}`)
  }

  return (
    <li
      className="article-container"
      onClick={() => goPost(post.slug)}
      onKeyDown={event => {
        if (event.key === 'Enter') goPost(post.slug)
      }}
      role="link"
      tabIndex={0}
    >
      <div className="article">
        <div className="article-thumbnail">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              post.cover ||
              '/default-cover.jpg'
            }
            alt=""
          />
          <span
            className="thumbnail-screen"
            style={{ background: themeConfig.theme.header_gradient_css }}
          />
        </div>

        <div className="article-content">
          <span>
            {post.pinned ? (
              <b className="article-tag">
                <span>
                  <SvgIcon
                    iconClass="hot"
                    width="1.05rem"
                    height="1.05rem"
                    className="-mb-0.5"
                    stroke="currentColor"
                  />
                  <span>{t('settings.pinned')}</span>
                </span>
              </b>
            ) : null}
            {post.feature ? (
              <b className="article-tag">
                <span>
                  <SvgIcon
                    iconClass="hot"
                    width="1.05rem"
                    height="1.05rem"
                    className="-mb-0.5"
                    stroke="currentColor"
                  />
                  <span>{t('settings.featured')}</span>
                </span>
              </b>
            ) : null}
            {post.categories && post.categories.length > 0 ? (
              <b
                onClick={event => {
                  event.stopPropagation()
                  router.push(
                    `/post/search?category=${post.categories![0].slug}`
                  )
                }}
              >
                {post.categories[0].name}
              </b>
            ) : post.categories ? (
              <b>{t('settings.default-category')}</b>
            ) : (
              <LoadingSkeleton height="20px" width="35px" />
            )}
          </span>

          <span className="flex flex-wrap">
            {post.tags && post.tags.length > 0 ? (
              <ul>
                {(post.min_tags || post.tags).map(tag => (
                  <li
                    key={tag.slug}
                    onClick={event => {
                      event.stopPropagation()
                      router.push(`/post/search?tag=${tag.slug}`)
                    }}
                  >
                    <em># </em>
                    <span>{tag.name}</span>
                  </li>
                ))}
              </ul>
            ) : post.tags ? (
              <ul>
                <li>
                  <em>#</em>
                  <span>{t('settings.default-tag')}</span>
                </li>
              </ul>
            ) : (
              <ul>
                <LoadingSkeleton count={2} height="16px" width="35px" />
              </ul>
            )}
          </span>

          {post.title ? (
            <h1 data-dia="article-link">{post.title}</h1>
          ) : (
            <LoadingSkeleton height="3rem" />
          )}

          {post.text ? (
            <p>{post.text}</p>
          ) : post.title ? (
            // Title already means the card resolved — don't keep a forever skeleton
            // when excerpt/body summary is simply empty.
            null
          ) : (
            <LoadingSkeleton count={4} height="16px" />
          )}

          {post.author && post.date ? (
            <div className="article-footer">
              <div className="flex flex-row items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={`cursor-pointer hover:opacity-50 ${shape}`}
                  src={post.author.avatar}
                  alt={`avatar-${post.author.name}`}
                  onClick={event => {
                    event.stopPropagation()
                    window.location.href = post.author?.link || '/'
                  }}
                />
                <span className="text-ob-dim">
                  <strong
                    className="cursor-pointer pr-1.5 text-ob-normal hover:text-ob hover:opacity-50"
                    onClick={event => {
                      event.stopPropagation()
                      window.location.href = post.author?.link || '/'
                    }}
                  >
                    {post.author.name}
                  </strong>
                  {t('settings.shared-on')} {t(post.date.month)} {post.date.day}
                  , {post.date.year}
                </span>
              </div>
            </div>
          ) : (
            <div className="article-footer">
              <div className="mt-6 flex flex-row items-center">
                <LoadingSkeleton
                  className="mr-2"
                  height="28px"
                  width="28px"
                  circle
                />
                <LoadingSkeleton height="20px" width="150px" />
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
