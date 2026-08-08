'use client'

import SvgIcon from '@/components/svg-icon/svg-icon'
import { useEffect, useState } from 'react'

type HeaderNotificationProps = {
  open?: boolean
  message?: string
  onClose?: () => void
}

export default function HeaderNotification({
  open = false,
  message = '',
  onClose
}: HeaderNotificationProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!open) return
    setProgress(100)
    const tick = window.setInterval(() => {
      setProgress(value => Math.max(0, value - 20))
    }, 800)
    const closer = window.setTimeout(() => {
      onClose?.()
      setProgress(100)
    }, 5000)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(closer)
    }
  }, [open, onClose])

  return (
    <div className={`notification absolute z-50 shadow-2xl ${open ? 'open' : ''}`}>
      <div className="relative flex flex-col overflow-hidden rounded-xl bg-ob-deep-900 pt-3">
        <div className="flex items-center space-x-4 px-6">
          <SvgIcon
            iconClass="bell"
            stroke="var(--text-normal)"
            fill="none"
            width="1.4rem"
            height="1.4rem"
          />
          <span>{message}</span>
        </div>
        <span className="progress-bar mt-3" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
