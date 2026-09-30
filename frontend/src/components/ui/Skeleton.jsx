/**
 * Yemxona ERP — Skeleton Loading Components
 * Standardized placeholders with smooth pulse animation using theme surface tokens.
 */

/**
 * Base pulsing placeholder
 */
export function Skeleton({ className = '', rounded = 'rounded-xl', ...props }) {
  return (
    <div
      className={`animate-pulse bg-surface-800/80 border border-surface-700/40 ${rounded} ${className}`}
      {...props}
    />
  );
}

/**
 * Table loading placeholder with headers and animated rows
 */
export function TableSkeleton({ rows = 5, cols = 5, className = '' }) {
  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-surface-700/60 bg-surface-900 ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-surface-700/60 bg-surface-800/30">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded-md" />
        ))}
      </div>
      {/* Rows skeleton */}
      <div className="divide-y divide-surface-800/50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={`h-4 flex-1 rounded-md ${c === 0 ? 'max-w-[40px]' : c === 1 ? 'max-w-[180px]' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Grid of metric / summary card skeletons
 */
export function CardSkeleton({ count = 4, className = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' }) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-7 w-36 rounded-md" />
            </div>
            <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
          </div>
          <Skeleton className="h-3 w-28 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/**
 * Form / Modal fields loading skeleton
 */
export function FormSkeleton({ fields = 4, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3.5 w-28 rounded-md" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
      <div className="flex gap-3 pt-3">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export default Skeleton;
