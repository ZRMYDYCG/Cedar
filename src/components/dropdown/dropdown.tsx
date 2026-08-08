'use client'

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode
} from 'react'

type DropdownContextValue = {
  active: boolean
  setActive: (value: boolean) => void
  hover: boolean
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

export function useDropdown() {
  const ctx = useContext(DropdownContext)
  if (!ctx) throw new Error('Dropdown components must be used within Dropdown')
  return ctx
}

type DropdownProps = {
  children: ReactNode
  className?: string
  hover?: boolean
  onCommand?: (name: string) => void
}

export default function Dropdown({
  children,
  className = '',
  hover = true,
  onCommand
}: DropdownProps) {
  const [active, setActive] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const uid = useId()

  useEffect(() => {
    if (hover) return
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setActive(false)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [hover])

  return (
    <DropdownContext.Provider value={{ active, setActive, hover }}>
      <div
        ref={rootRef}
        className={`ob-dropdown relative z-50 ${active ? 'open' : ''} ${className}`}
        data-uid={uid}
        onClick={() => {
          if (!hover) setActive(value => !value)
        }}
        onMouseEnter={() => {
          if (hover) setActive(true)
        }}
        onMouseLeave={() => {
          if (hover) setActive(false)
        }}
        onKeyDown={event => {
          if (event.key === 'Escape') setActive(false)
        }}
        data-command-handler={onCommand ? '1' : undefined}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export { DropdownContext }
