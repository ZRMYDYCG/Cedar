import type { ButtonHTMLAttributes, ReactNode } from 'react'

type SecondaryButtonProps = {
  text?: string
  children?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function SecondaryButton({
  text,
  children,
  className = '',
  ...rest
}: SecondaryButtonProps) {
  return (
    <button
      type="button"
      className={`z-10 flex cursor-pointer select-none items-center justify-center rounded-xl border-2 border-solid border-ob-bright bg-ob-deep-900 px-3 py-1 font-semibold text-ob-bright opacity-80 transition ${className}`}
      {...rest}
    >
      {children ?? text}
    </button>
  )
}
