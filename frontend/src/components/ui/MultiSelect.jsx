import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Search, CheckSquare, Square } from 'lucide-react';
import { normalizeOption, filterOptions, toggleMultiSelect, formatMultiSelectSummary } from '../../utils/selectUtils';

/**
 * Custom MultiSelect Component with Search, Chips, and Select-All
 *
 * Props:
 * - options: Array of options (objects with value, label, or simple strings)
 * - value: Array of selected values (e.g. ['cat1', 'cat2'])
 * - onChange: Callback (selectedArray) => void
 * - placeholder: Default trigger label
 * - searchable: Show search input inside popup
 * - showChips: Show removable chips directly in trigger (default: true)
 * - maxChips: Max chips to show before condensing to "+N" badge (default: 3)
 * - disabled: Disabled state
 * - className: Outer classes
 */
export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = 'Barchasi',
  searchable = true,
  showChips = true,
  maxChips = 2,
  disabled = false,
  className = '',
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

  // Selected options array
  const selectedOptions = useMemo(() => {
    const set = new Set(value || []);
    return normalizedOptions.filter((opt) => set.has(opt.value));
  }, [normalizedOptions, value]);

  // Filtered options
  const filtered = useMemo(() => {
    return filterOptions(normalizedOptions, search);
  }, [normalizedOptions, search]);

  // Outside click listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      if (searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, searchable]);

  const handleToggle = (optValue) => {
    const updated = toggleMultiSelect(value, optValue);
    onChange?.(updated);
  };

  const handleSelectAll = () => {
    const allValues = normalizedOptions.map((o) => o.value);
    onChange?.(allValues);
  };

  const handleClearAll = () => {
    onChange?.([]);
  };

  const handleRemoveChip = (e, val) => {
    e.stopPropagation();
    onChange?.((value || []).filter((v) => v !== val));
  };

  const isAllSelected = normalizedOptions.length > 0 && (value || []).length === normalizedOptions.length;

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left ${className}`}
      id={id}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[42px] px-3 py-1.5 flex items-center justify-between gap-2 border bg-surface-900 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? 'border-primary-500 ring-1 ring-primary-500/50 shadow-sm'
            : 'border-surface-700 hover:border-surface-600'
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 pr-1">
          {selectedOptions.length === 0 ? (
            <span className="text-xs text-surface-500">{placeholder}</span>
          ) : showChips ? (
            <>
              {selectedOptions.slice(0, maxChips).map((opt) => (
                <span
                  key={String(opt.value)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-800 border border-surface-700 text-xs font-semibold text-surface-200"
                >
                  <span className="truncate max-w-[120px]">{opt.label}</span>
                  {!disabled && (
                    <span
                      onClick={(e) => handleRemoveChip(e, opt.value)}
                      role="button"
                      tabIndex={0}
                      className="text-surface-400 hover:text-danger-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </span>
              ))}
              {selectedOptions.length > maxChips && (
                <span className="px-1.5 py-0.5 rounded-md bg-primary-600/10 text-primary-600 dark:text-primary-400 text-[11px] font-bold">
                  +{selectedOptions.length - maxChips}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-semibold text-surface-100 truncate">
              {formatMultiSelectSummary(value, normalizedOptions, placeholder, maxChips)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-surface-400">
          {selectedOptions.length > 0 && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              role="button"
              tabIndex={0}
              className="p-1 rounded-md text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
              title="Barchasini tozalash"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-500' : ''}`}
          />
        </div>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-1.5 w-full min-w-[220px] rounded-xl border border-surface-700 bg-surface-900 shadow-xl animate-scale-in overflow-hidden">
          {/* Search & Actions Header */}
          <div className="p-2 border-b border-surface-700/60 bg-surface-800/40 space-y-2">
            {searchable && (
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
            )}

            {/* Quick Actions (Select all / Clear) */}
            <div className="flex items-center justify-between text-[11px] font-bold pt-0.5 px-0.5">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={isAllSelected}
                className="text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-40"
              >
                Barchasini tanlash
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={selectedOptions.length === 0}
                className="text-surface-400 hover:text-danger-500 disabled:opacity-40"
              >
                Tozalash ({selectedOptions.length})
              </button>
            </div>
          </div>

          {/* Options List with Checkboxes */}
          <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-surface-500">
                Mos variant topilmadi
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = (value || []).includes(opt.value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleToggle(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-primary-600/10 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-surface-200 hover:bg-surface-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-surface-500 shrink-0" />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {opt.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-surface-800 text-surface-400 shrink-0">
                        {opt.badge}
                      </span>
                    )}
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

export default MultiSelect;
