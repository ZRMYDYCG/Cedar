'use client'

import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs'
import Paginator from '@/components/paginator/paginator'
import { useAppStore } from '@/stores/app'
import type { PostCard } from '@/types/post'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Fragment, useEffect, useMemo, useState } from 'react'

const PAGE_SIZE = 12

type ArchiveGroup = {
  month: string
  year: number
  posts: PostCard[]
}

function groupArchives(posts: PostCard[]): ArchiveGroup[] {
  const map = new Map<string, ArchiveGroup>()
  for (const post of posts) {
    if (!post.date) continue
    const key = `${post.date.month}-${post.date.year}`
    const existing = map.get(key)
    if (existing) existing.posts.push(post)
    else {
      map.set(key, {
        month: post.date.month,
        year: post.date.year,
        posts: [post]
      })
    }
  }
  return Array.from(map.values())
}

export default function ArchivesView({ posts }: { posts: PostCard[] }) {
  const t = useTranslations()
  const setHeaderImage = useAppStore(s => s.setHeaderImage)
  const resetHeaderImage = useAppStore(s => s.resetHeaderImage)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setHeaderImage('/default-cover.jpg')
    return () => resetHeaderImage()
  }, [setHeaderImage, resetHeaderImage])

  const pagePosts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return posts.slice(start, start + PAGE_SIZE)
  }, [page, posts])

  const archives = useMemo(() => groupArchives(pagePosts), [pagePosts])
  const pageTitle = t('menu.archives')

  return (
    <div className="mt-20 flex flex-col">
      <Breadcrumbs current={pageTitle} />
      <div className="post-header">
        <h1 className="post-title uppercase text-white">{pageTitle}</h1>
      </div>
      <div className="block min-h-screen rounded-2xl bg-ob-deep-800 px-14 py-16 shadow-xl">
        <ul className="timeline timeline-centered">
          {archives.map(group => (
            <Fragment key={`${group.month}-${group.year}`}>
              <li className="timeline-item period">
                <div className="timeline-info" />
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <h2 className="timeline-title">
                    {t(group.month)} {group.year}
                  </h2>
                </div>
              </li>
              {group.posts.map(post => (
                <li className="timeline-item" key={post.slug}>
                  <div className="timeline-info">
                    <span>
                      {post.date
                        ? `${t(post.date.month)} ${post.date.day}, ${post.date.year}`
                        : ''}
                    </span>
                  </div>
                  <div className="timeline-marker" />
                  <div className="timeline-content">
                    <Link href={`/post/${post.slug}`}>
                      <h3 className="timeline-title">{post.title}</h3>
                    </Link>
                    <p>{post.text}</p>
                  </div>
                </li>
              ))}
            </Fragment>
          ))}
        </ul>
        <Paginator
          page={page}
          pageSize={PAGE_SIZE}
          pageTotal={posts.length}
          onPageChange={next => {
            setPage(next)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      </div>
    </div>
  )
}
