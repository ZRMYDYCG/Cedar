'use client'

import SvgIcon from '@/components/svg-icon/svg-icon'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

type PaginatorProps = {
  pageTotal: number
  pageSize: number
  page: number
  onPageChange: (page: number) => void
}

export default function Paginator({
  pageTotal,
  pageSize,
  page,
  onPageChange
}: PaginatorProps) {
  const t = useTranslations('settings.paginator')
  const pages = Math.max(1, Math.ceil(pageTotal / pageSize))

  const paginator = useMemo(() => {
    if (pages <= 3) {
      return {
        head: 0,
        pages: Array.from({ length: pages }, (_, i) => i + 1),
        end: 0
      }
    }
    if (page >= 1 && page < 3) {
      return { head: 1, pages: [2, 3, '...'] as (number | string)[], end: pages }
    }
    if (page >= 3 && page <= pages - 2) {
      return {
        head: 1,
        pages: ['...', page - 1, page, page + 1, '...'] as (number | string)[],
        end: pages
      }
    }
    return {
      head: 1,
      pages: ['...', pages - 2, pages - 1] as (number | string)[],
      end: pages
    }
  }, [page, pages])

  const change = (value: number | string) => {
    if (value === '...') return
    onPageChange(Number(value))
  }

  if (pages <= 1) return null

  return (
    <div className="paginator">
      <ul>
        {page > 1 ? (
          <li
            className="page-navigator navigator-right text-ob-bright"
            onClick={() => change(page - 1)}
          >
            <SvgIcon
              className="font-bold"
              iconClass="arrow-left"
              height="1.25rem"
              width="1.25rem"
              fill="var(--text-accent)"
              stroke="var(--text-accent)"
            />
            <span>{t('newer')}</span>
          </li>
        ) : null}
        {paginator.head !== 0 ? (
          <li
            className={page === paginator.head ? 'active' : ''}
            onClick={() => change(paginator.head)}
          >
            {paginator.head}
          </li>
        ) : null}
        {paginator.pages.map((item, key) => (
          <li
            key={`${item}-${key}`}
            className={page === item ? 'active' : ''}
            onClick={() => change(item)}
          >
            <span>{item}</span>
          </li>
        ))}
        {paginator.end !== 0 ? (
          <li
            className={page === paginator.end ? 'active' : ''}
            onClick={() => change(paginator.end)}
          >
            {paginator.end}
          </li>
        ) : null}
        {page < pages ? (
          <li
            className="page-navigator navigator-left text-ob-bright"
            onClick={() => change(page + 1)}
          >
            <span>{t('older')}</span>
            <SvgIcon
              className="font-bold"
              iconClass="arrow-right"
              height="1.25rem"
              width="1.25rem"
              fill="var(--text-accent)"
              stroke="var(--text-accent)"
            />
          </li>
        ) : null}
      </ul>
    </div>
  )
}
