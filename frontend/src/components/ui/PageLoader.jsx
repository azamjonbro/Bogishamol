import { Wheat } from 'lucide-react';

/**
 * Standardized Ring Spinner
 */
export function Spinner({ size = 'md', className = '', color = 'primary' }) {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
    xl: 'w-12 h-12 border-3',
  };

  const colorClasses = {
    primary: 'border-primary-500 border-t-transparent',
    white: 'border-white/30 border-t-white',
    surface: 'border-surface-600 border-t-surface-200',
  };

  return (
    <div
      className={`rounded-full animate-spin shrink-0 ${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.primary} ${className}`}
      role="status"
      aria-label="Yuklanmoqda"
    />
  );
}

/**
 * Full page or large container Loader
 */
export function PageLoader({ text = 'Yuklanmoqda...', fullScreen = false }) {
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-20 w-full';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center text-center animate-fade-in space-y-3">
        {/* Brand Icon Badge */}
        <div className="relative">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-md">
            <Wheat className="w-7 h-7" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-900 flex items-center justify-center border border-surface-700">
            <Spinner size="xs" />
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-surface-100">{text}</p>
          <p className="text-xs text-surface-400 mt-0.5">Iltimos, kuting...</p>
        </div>
      </div>
    </div>
  );
}

export default PageLoader;
