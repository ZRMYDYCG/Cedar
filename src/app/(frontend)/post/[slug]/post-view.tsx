'use client'

import ArticleCard from '@/components/article-card/article-card'
import Comment from '@/components/comment/comment'
import PostStats from '@/components/post/post-stats'
import Profile from '@/components/sidebar/profile'
import Sidebar from '@/components/sidebar/sidebar'
import Toc from '@/components/sidebar/toc'
import SubTitle from '@/components/title/sub-title'
import { useAppStore } from '@/stores/app'
import type { PostCard } from '@/types/post'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type PostViewProps = {
  post: PostCard & { html?: string }
  prev?: PostCard
  next?: PostCard
}

export default function PostView({ post, prev, next }: PostViewProps) {
  const router = useRouter()
  const t = useTranslations()
  const themeConfig = useAppStore(s => s.themeConfig)
  const setHeaderImage = useAppStore(s => s.setHeaderImage)
  const resetHeaderImage = useAppStore(s => s.resetHeaderImage)

  useEffect(() => {
    setHeaderImage(post.cover || '/default-cover.jpg')
    return () => resetHeaderImage()
  }, [post.cover, setHeaderImage, resetHeaderImage])

  const html =
    post.html ||
    `<p>${post.text || ''}</p>`

  return (
    <div className="mt-20 flex flex-col">
      <div className="main-grid">
        <div className="post-header">
          <span className="post-labels">
            <b
              onClick={() =>
                post.categories?.[0] &&
                router.push(`/post/search?category=${post.categories[0].slug}`)
              }
            >
              <span>
                {post.categories?.[0]?.name || t('settings.default-category')}
              </span>
            </b>
            <ul>
              {(post.tags || []).length > 0 ? (
                post.tags!.map(tag => (
                  <li
                    key={tag.slug}
                    onClick={() => router.push(`/post/search?tag=${tag.slug}`)}
                  >
                    <em className="opacity-50">#</em>
                    {tag.name}
                  </li>
                ))
              ) : (
                <li>
                  <b className="opacity-50">#</b>
                  {t('settings.default-tag')}
                </li>
              )}
            </ul>
          </span>

          <h1 className="post-title text-white">{post.title}</h1>

          <div className="mt-8 mb-4 flex flex-row items-center justify-start">
            <div className="post-footer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={themeConfig.theme.profile_shape}
                src={post.author?.avatar}
                alt={`author-${post.author?.name}`}
              />
              <span className="text-white opacity-80">
                <strong className="cursor-pointer pr-1.5 text-white hover:opacity-50">
                  {post.author?.name}
                </strong>
                <span className="opacity-70">
                  {t('settings.shared-on')}{' '}
                  {post.date ? t(post.date.month) : ''} {post.date?.day},{' '}
                  {post.date?.year}
                </span>
              </span>
            </div>
            <PostStats
              postWordCount={post.count_time?.symbolsCount}
              postTimeCount={post.count_time?.symbolsTime}
              comments
            />
          </div>
        </div>
      </div>

      <div className="main-grid">
        <div>
          <div
            className="post-html"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {prev ? (
              <div className="flex h-full w-full flex-col lg:mr-4">
                <SubTitle
                  title="settings.paginator.prev"
                  icon="arrow-left"
                  side="left"
                />
                <ul className="flex flex-col">
                  <ArticleCard data={prev} />
                </ul>
              </div>
            ) : null}
            {next ? (
              <div className="flex h-full w-full flex-col lg:ml-4">
                <SubTitle
                  title="settings.paginator.older"
                  icon="arrow-right"
                  side="right"
                />
                <ul className="flex flex-col">
                  <ArticleCard data={next} />
                </ul>
              </div>
            ) : null}
          </div>

          <div id="comments">
            <Comment
              title={post.title}
              uid={post.slug}
              targetKind="post"
              body={post.text}
            />
          </div>
        </div>
        <div>
          <Sidebar>
            <Profile />
            <Toc />
          </Sidebar>
        </div>
      </div>
    </div>
  )
}
