'use client'

import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs'
import EmptyState from '@/components/empty-state/empty-state'
import type { JoyCard } from '@/data/cms/joys-shared'
import { useAppStore } from '@/stores/app'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

function formatDay(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    }).format(new Date(iso))
  } catch {
    return iso.slice(0, 10)
  }
}

export default function JoysView({ joys }: { joys: JoyCard[] }) {
  const t = useTranslations()
  const tJoys = useTranslations('joys')
  const locale = useAppStore(s => s.locale) || 'zh-CN'
  const setHeaderImage = useAppStore(s => s.setHeaderImage)
  const resetHeaderImage = useAppStore(s => s.resetHeaderImage)
  const title = t('menu.joys')

  useEffect(() => {
    setHeaderImage('/default-cover.jpg')
    return () => resetHeaderImage()
  }, [setHeaderImage, resetHeaderImage])

  return (
    <div className="mt-20">
      <Breadcrumbs current={title} />
      <div className="joys-page">
        <header className="joys-header">
          <h1>{title}</h1>
          <p>{tJoys('subtitle')}</p>
        </header>

        {joys.length === 0 ? (
          <EmptyState
            variant="panel"
            title={tJoys('empty')}
            description={tJoys('empty-hint')}
          />
        ) : (
          <ol className="joys-feed">
            {joys.map(entry => (
              <li key={entry.id} className="joys-card">
                <time dateTime={entry.day.slice(0, 10)}>
                  {formatDay(entry.day, locale)}
                </time>
                <ol className="joys-items">
                  {entry.items.map((text, index) => (
                    <li key={`${entry.id}-${index}`}>
                      <span className="joys-index">{index + 1}</span>
                      <p>{text}</p>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
