import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';
import { normalizeOption, filterOptions } from '../../utils/selectUtils';

/**
 * Custom Single-Select Dropdown Component
 *
 * Props:
 * - options: Array of { value, label, icon, disabled, category, ... } or simple strings
 * - value: Currently selected value
 * - onChange: Callback (value, option) => void
 * - placeholder: Trigger placeholder text
 * - searchable: Whether to show search filter input (default: true)
 * - clearable: Whether to show quick clear (x) button (default: false)
 * - disabled: Disable the entire select
 * - className: Outer container classes
 * - size: 'sm' | 'md' | 'lg'
 */
export function Select({
  options = [],
  value,
  onChange,
  placeholder = 'Tanlang...',
  searchable = true,
  clearable = false,
  disabled = false,
  className = '',
  size = 'md',
  id,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => normalizeOption(opt));
  }, [options]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value) || null;
  }, [normalizedOptions, value]);

  // Filter options based on search query
  const filtered = useMemo(() => {
    return filterOptions(normalizedOptions, search);
  }, [normalizedOptions, search]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input when opened
      if (searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, searchable]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
  };

  const handleSelect = (opt) => {
    if (opt.disabled) return;
    onChange?.(opt.value, opt);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('', null);
    setSearch('');
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg',
    md: 'px-3.5 py-2.5 text-sm rounded-xl',
    lg: 'px-4 py-3 text-base rounded-xl',
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left ${className}`}
      onKeyDown={handleKeyDown}
      id={id}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 border bg-surface-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? 'border-primary-500 ring-1 ring-primary-500/50 shadow-sm'
            : 'border-surface-700 hover:border-surface-600'
        } ${sizeClasses[size] || sizeClasses.md}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-primary-500">{selectedOption.icon}</span>
          )}
          {selectedOption ? (
            <span className="font-semibold text-surface-100 truncate">
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-surface-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-surface-400">
          {clearable && selectedOption && !disabled && (
            <span
              onClick={handleClear}
              role="button"
              tabIndex={0}
              className="p-0.5 rounded hover:text-surface-200 hover:bg-surface-800 transition-colors"
              title="Tozalash"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-500' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-1.5 w-full min-w-[200px] rounded-xl border border-surface-700 bg-surface-900 shadow-xl animate-scale-in overflow-hidden">
          {/* Search filter input */}
          {searchable && (
            <div className="p-2 border-b border-surface-700/60 bg-surface-800/40">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Qidirish..."
                  className="w-full pl-8 pr-7 py-1.5 bg-surface-900 border border-surface-700 rounded-lg text-xs text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-surface-500">
                Mos variant topilmadi
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-primary-600 text-white font-semibold shadow-sm'
                        : 'text-surface-200 hover:bg-surface-800 hover:text-surface-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-surface-800 text-surface-400'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Select;
