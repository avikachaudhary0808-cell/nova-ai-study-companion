export function Skeleton({ className = '', height, width, rounded = 'md' }) {
  const radius = {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  }[rounded] || '0.5rem'

  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius: radius,
      }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} width="100%" />
      <Skeleton height={14} width="80%" />
      <Skeleton height={100} />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-3">
      <Skeleton height={16} width="40%" />
      <Skeleton height={16} width="25%" />
      <Skeleton height={16} width="20%" />
      <Skeleton height={16} width="15%" />
    </div>
  )
}
