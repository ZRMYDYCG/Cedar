'use client'

import type { ReactNode } from 'react'

type ToggleSwitchProps = {
  status: boolean
  onChangeStatus: (status: boolean) => void
  children?: ReactNode
}

/** 1:1 with Vue `ToggleSwitch/Toggle.vue` */
export default function ToggleSwitch({
  status,
  onChangeStatus,
  children
}: ToggleSwitchProps) {
  return (
    <div
      className="toggler"
      onClick={() => onChangeStatus(!status)}
      role="switch"
      aria-checked={status}
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onChangeStatus(!status)
        }
      }}
    >
      <div className="toggle-track" />
      <div
        className="slider"
        style={{
          transform: `translateX(${status ? '18px' : '0'})`,
          backgroundColor: status ? '#6e40c9' : '#100E16'
        }}
      >
        {children}
      </div>
    </div>
  )
}
