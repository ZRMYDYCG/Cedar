type LoadingSkeletonProps = {
  width?: string
  height?: string
  circle?: boolean
  className?: string
  count?: number
}

export default function LoadingSkeleton({
  width = '100%',
  height = '1rem',
  circle = false,
  className = '',
  count = 1
}: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className={`inline-block animate-pulse bg-ob-trans ${
            circle ? 'rounded-full' : 'rounded-md'
          } ${className}`}
          style={{ width, height }}
        />
      ))}
    </>
  )
}
