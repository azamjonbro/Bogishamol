import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ showLabel = false, className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      id="theme-toggle-btn"
      aria-label={isDark ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}
      title={isDark ? "Yorug' rejim" : "Qorong'i rejim"}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-200 border border-surface-700 bg-surface-800/80 hover:bg-surface-700/60 text-surface-300 hover:text-surface-100 shadow-sm ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-accent-400 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Sun className="w-4 h-4 text-warning-500 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-surface-300">
          {isDark ? "Qorong'i" : "Yorug'"}
        </span>
      )}
    </button>
  );
}
