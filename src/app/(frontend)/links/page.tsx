'use client'

import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs'
import Comment from '@/components/comment/comment'
import LinkBox from '@/components/link/link-box'
import LinkCategoryList from '@/components/link/link-category-list'
import PostStats from '@/components/post/post-stats'
import { buildFriendPairs, siteFriends } from '@/data/site-taxonomy'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

export default function LinksPage() {
  const t = useTranslations()
  const setHeaderImage = useAppStore(s => s.setHeaderImage)
  const resetHeaderImage = useAppStore(s => s.resetHeaderImage)
  const pageTitle = t('settings.links')

  useEffect(() => {
    setHeaderImage('/default-cover.jpg')
    return () => resetHeaderImage()
  }, [setHeaderImage, resetHeaderImage])

  const jumpToContent = () => {
    document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' })
  }

  const categorized = {
    'settings.links-badge-tech': siteFriends.filter(
      f => f.label !== 'links-badge-vip'
    ),
    'settings.links-badge-vip': siteFriends.filter(
      f => f.label === 'links-badge-vip'
    )
  }

  return (
    <div className="mt-20">
      <Breadcrumbs current={pageTitle} />
      <div className="flex flex-col">
        <div className="post-header">
          <h1 className="post-title uppercase text-white">{pageTitle}</h1>
          <div className="mt-8 mb-4 flex flex-row items-center justify-start">
            <PostStats postWordCount={420} postTimeCount="2 mins" comments />
          </div>
        </div>

        <LinkBox
          data={buildFriendPairs(siteFriends)}
          onApplyClicked={jumpToContent}
        />

        <LinkCategoryList links={categorized} />

        <div className="mt-8" id="content">
          <div className="post-html">
            <p>欢迎交换友链。请在申请时附上站点名称、简介与头像地址。</p>
          </div>
        </div>

        <div id="comments">
          <Comment title={pageTitle} uid="links" body="friends" />
        </div>
      </div>
    </div>
  )
}
