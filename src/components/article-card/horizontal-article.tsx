'use client'

import LoadingSkeleton from '@/components/loading-skeleton/loading-skeleton'
import SvgIcon from '@/components/svg-icon/svg-icon'
import { useAppStore } from '@/stores/app'
import type { PostCard } from '@/types/post'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type HorizontalArticleProps = {
  data?: PostCard
  className?: string
}

export default function HorizontalArticle({
  data: post = {},
  className = ''
}: HorizontalArticleProps) {
  const t = useTranslations()
  const router = useRouter()
  const themeConfig = useAppStore(s => s.themeConfig)
  const shape = themeConfig.theme.profile_shape
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const tags = post.tags || []
  const tagLimit = isMobile ? 2 : 5
  const numberOfTags = Math.min(tags.length, tagLimit)

  const goPost = (slug?: string) => {
    if (!slug) return
    router.push(`/post/${slug}`)
  }

  return (
    <div
      className={`article-container ${className}`}
      onClick={() => goPost(post.slug)}
      role="link"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'Enter') goPost(post.slug)
      }}
    >
      <div className="feature-article">
        <div className="feature-thumbnail">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="ob-hz-thumbnail"
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

        <div className="feature-content">
          <span>
            {post.pinned ? (
              <b className="article-tag">
                <span>
                  <SvgIcon
                    iconClass="hot"
                    width="1.05rem"
                    height="1.05rem"
                    className="-mb-0.5 mr-1"
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
                    className="-mb-0.5 mr-1"
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
            <ul>
              {tags.length > 0 ? (
                Array.from({ length: numberOfTags }).map((_, index) => (
                  <li
                    key={tags[index].slug}
                    onClick={event => {
                      event.stopPropagation()
                      router.push(`/post/search?tag=${tags[index].slug}`)
                    }}
                  >
                    <em># </em>
                    <span>{tags[index].name}</span>
                  </li>
                ))
              ) : post.tags ? (
                <li>
                  <em># </em>
                  <span>{t('settings.default-tag')}</span>
                </li>
              ) : (
                <LoadingSkeleton count={2} height="16px" width="35px" />
              )}
            </ul>
          </span>

          {post.title ? (
            <h1 data-dia="article-link">{post.title}</h1>
          ) : (
            <LoadingSkeleton height="3rem" />
          )}

          {post.text ? (
            <p>{post.text}</p>
          ) : (
            <LoadingSkeleton count={3} height="20px" />
          )}

          {post.count_time ? (
            <div className="article-footer">
              <div className="flex flex-row items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={`cursor-pointer hover:opacity-50 ${shape}`}
                  src={post.author?.avatar}
                  alt={`avatar-${post.author?.name}`}
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
                    {post.author?.name}
                  </strong>
                  {post.date
                    ? `${t('settings.shared-on')} ${t(post.date.month)} ${post.date.day}, ${post.date.year}`
                    : null}
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
    </div>
  )
}
