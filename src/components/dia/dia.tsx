'use client'

import { useAppStore } from '@/stores/app'
import { useEffect, useState, type CSSProperties } from 'react'

export default function Dia() {
  const ready = useAppStore(s => s.configReady)
  const themeConfig = useAppStore(s => s.themeConfig)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!ready) return
    const timer = window.setTimeout(() => setShow(true), 1000)
    return () => window.clearTimeout(timer)
  }, [ready])

  if (!ready || !show) return null

  const { color_2, color_3 } = themeConfig.theme.gradient
  const cssVariables = {
    '--aurora-dia--linear-gradient': themeConfig.theme.header_gradient_css,
    '--aurora-dia--linear-gradient-hover': `linear-gradient(to bottom, ${color_2}, ${color_3})`,
    '--aurora-dia--platform-light': color_3
  } as CSSProperties

  return (
    <div id="bot-container" className="hidden lg:block">
      <div id="Aurora-Dia--body" style={cssVariables}>
        <div id="Aurora-Dia--tips-wrapper">
          <div id="Aurora-Dia--tips" className="Aurora-Dia--tips">
            早上好呀～
          </div>
        </div>
        <div id="Aurora-Dia" className="Aurora-Dia">
          <div id="Aurora-Dia--eyes" className="Aurora-Dia--eyes">
            <div id="Aurora-Dia--left-eye" className="Aurora-Dia--eye left" />
            <div id="Aurora-Dia--right-eye" className="Aurora-Dia--eye right" />
          </div>
        </div>
        <div className="Aurora-Dia--platform" />
      </div>
    </div>
  )
}
