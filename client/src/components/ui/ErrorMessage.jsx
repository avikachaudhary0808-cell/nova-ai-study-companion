export function ErrorMessage({ message, onDismiss, retry }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-start justify-between">
      <div className="flex-1">
        <span>{message}</span>
        {retry && (
          <button onClick={retry} className="ml-3 underline font-medium">
            Retry
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-3 text-red-600 hover:text-red-800 dark:text-red-300">
          ✕
        </button>
      )}
    </div>
  )
}
