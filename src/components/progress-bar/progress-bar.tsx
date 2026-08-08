'use client'

import { useAppStore } from '@/stores/app'

export default function ProgressBar() {
  const progress = useAppStore(s => s.scrollProgress)

  return (
    <div
      id="progress-bar"
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-[3px] rounded-full shadow-2xl"
      style={{
        width: `${progress}%`,
        background: 'var(--main-gradient)'
      }}
    />
  )
}
