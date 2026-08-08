'use client'

import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

type Hit = {
  slug: string
  title: string
  content: string
}

type SearchPost = {
  slug?: string
  title?: string
  text?: string
}

export default function SearchModal() {
  const open = useAppStore(s => s.searchModalOpen)
  const setOpen = useAppStore(s => s.setSearchModalOpen)
  const t = useTranslations('settings')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [keyword, setKeyword] = useState('')
  const [active, setActive] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [posts, setPosts] = useState<SearchPost[]>([])

  useEffect(() => {
    if (!open || posts.length) return
    fetch('/api/content/posts')
      .then(res => res.json())
      .then(data => setPosts(data.docs || []))
      .catch(() => setPosts([]))
  }, [open, posts.length])

  const results = useMemo<Hit[]>(() => {
    const q = keyword.trim().toLowerCase()
    if (!q) return []
    return posts
      .filter(
        post =>
          post.title?.toLowerCase().includes(q) ||
          post.text?.toLowerCase().includes(q)
      )
      .map(post => {
        const text = post.text || ''
        const idx = text.toLowerCase().indexOf(q)
        const snippet =
          idx >= 0
            ? text.slice(Math.max(0, idx - 20), idx + q.length + 40)
            : text.slice(0, 80)
        const highlighted = snippet.replace(
          new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'),
          '<mark>$1</mark>'
        )
        return {
          slug: post.slug || '',
          title: post.title || '',
          content: highlighted
        }
      })
  }, [keyword, posts])

  useEffect(() => {
    document.body.classList.toggle('modal--active', open)
    if (!open) {
      setMounted(false)
      return
    }
    setKeyword('')
    setActive(0)
    const show = window.setTimeout(() => setMounted(true), 10)
    const focus = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(focus)
      document.body.classList.remove('modal--active')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActive(i => Math.min(Math.max(results.length - 1, 0), i + 1))
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActive(i => Math.max(0, i - 1))
      }
      if (event.key === 'Enter' && results[active]) {
        router.push(`/post/${results[active].slug}`)
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, active, router, setOpen])

  if (!open) return null

  return (
    <div
      id="search-modal"
      onClick={event => {
        if (event.target === event.currentTarget) setOpen(false)
      }}
      tabIndex={-1}
    >
      {mounted ? (
        <div id="search-container" className="search-container">
          <header className="flex px-4 pt-4">
            <form
              className="search-form"
              onSubmit={event => event.preventDefault()}
            >
              <label
                id="search-label"
                className="flex items-center justify-center"
                htmlFor="search-input"
              >
                <svg
                  className="fill-current stroke-current text-ob"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="1"
                    d="M15.9996 15.2877L15.2925 15.9948L21.2958 21.9981L22.0029 21.291L15.9996 15.2877Z"
                  />
                  <path
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="1"
                    fill="rgba(0,0,0,0)"
                    d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
                  />
                </svg>
              </label>
              <input
                type="search"
                id="search-input"
                ref={inputRef}
                className="search-input"
                autoComplete="off"
                value={keyword}
                onChange={event => {
                  setKeyword(event.target.value)
                  setActive(0)
                }}
              />
              {keyword.length > 0 ? (
                <button
                  className="search-btn"
                  type="button"
                  title="Clear the query"
                  onClick={() => setKeyword('')}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20">
                    <path
                      d="M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ) : null}
            </form>
          </header>

          <div id="Search-Dropdown" className="search-dropdown">
            {!keyword ? (
              <div className="search-startscreen">
                <p>{t('no-recent-search')}</p>
              </div>
            ) : null}
            {keyword && results.length === 0 ? (
              <div className="search-startscreen">
                <p>{t('no-search-result')}</p>
              </div>
            ) : null}
            {results.length > 0 ? (
              <section>
                <div className="search-hit-label">
                  {t('search-result').replace('[total]', String(results.length))}
                </div>
                <ul id="search-menu">
                  {results.map((result, index) => (
                    <li
                      key={result.slug}
                      className={`search-hit ${index === active ? 'active' : ''}`}
                      id={`search-hit-item-${index}`}
                    >
                      <a
                        href={`/post/${result.slug}`}
                        onClick={event => {
                          event.preventDefault()
                          router.push(`/post/${result.slug}`)
                          setOpen(false)
                        }}
                      >
                        <div className="search-hit-container">
                          <div className="search-hit-icon">
                            <svg width="20" height="20" viewBox="0 0 20 20">
                              <path
                                d="M17 6v12c0 .52-.2 1-1 1H4c-.7 0-1-.33-1-1V2c0-.55.42-1 1-1h8l5 5zM14 8h-3.13c-.51 0-.87-.34-.87-.87V4"
                                stroke="currentColor"
                                fill="none"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div className="search-hit-content-wrapper">
                            <span className="search-hit-title">
                              {result.title}
                            </span>
                            <span
                              className="search-hit-path"
                              dangerouslySetInnerHTML={{
                                __html: result.content
                              }}
                            />
                          </div>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <footer className="search-footer">
            <div className="search-logo">
              <span className="search-label">{t('searched-by')}</span>
            </div>
            <ul className="search-commands">
              <li>
                <span className="search-commands-key">↵</span>
                <span className="search-commands-label">{t('cmd-to-select')}</span>
              </li>
              <li>
                <span className="search-commands-key">↑</span>
                <span className="search-commands-key">↓</span>
                <span className="search-commands-label">
                  {t('cmd-to-navigate')}
                </span>
              </li>
              <li>
                <span className="search-commands-key">esc</span>
                <span className="search-commands-label">{t('cmd-to-close')}</span>
              </li>
            </ul>
          </footer>
        </div>
      ) : null}
    </div>
  )
}
