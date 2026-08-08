'use client'

import PostStats from '@/components/post/post-stats'
import Profile from '@/components/sidebar/profile'
import Sidebar from '@/components/sidebar/sidebar'
import Toc from '@/components/sidebar/toc'
import type { ReactNode } from 'react'

type PageContentProps = {
  title: string
  html?: string
  wordCount?: number | string
  timeCount?: string
  comments?: boolean
  children?: ReactNode
}

export default function PageContent({
  title,
  html = '',
  wordCount = '—',
  timeCount = '—',
  comments = false,
  children
}: PageContentProps) {
  return (
    <div className="flex flex-col">
      <div className="post-header">
        <h1 className="post-title uppercase text-white">{title}</h1>
        <div className="mt-8 flex flex-row items-center justify-start">
          <PostStats
            postWordCount={wordCount}
            postTimeCount={timeCount}
            comments={comments}
          />
        </div>
      </div>
      <div className="main-grid">
        <div className="relative">
          {html ? (
            <div
              className="post-html"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <div className="block min-h-screen rounded-2xl bg-ob-deep-800 px-14 py-16 shadow-xl" />
          )}
          {children}
        </div>
        <div className="col-span-1">
          <Sidebar>
            <Profile />
            <Toc />
          </Sidebar>
        </div>
      </div>
    </div>
  )
}
