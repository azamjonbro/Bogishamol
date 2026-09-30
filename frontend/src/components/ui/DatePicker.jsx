import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  UZ_MONTHS,
  UZ_WEEKDAYS_SHORT,
  toISODateString,
  formatDateUz,
  getMonthMatrix,
  getDatePresets,
} from '../../utils/dateUtils';

/**
 * Custom DatePicker Component with Uzbek Localization, Calendar Grid & Quick Presets
 *
 * Props:
 * - value: 'YYYY-MM-DD' string
 * - onChange: (dateStr: string) => void
 * - placeholder: Input placeholder
 * - showPresets: Show top preset chips (Bugun, Kecha, Bu oy)
 * - clearable: Show clear button
 * - disabled: Disabled state
 * - className: Outer container classes
 */
export function DatePicker({
  value = '',
  onChange,
  placeholder = 'Sanani tanlang...',
  showPresets = true,
  clearable = true,
  disabled = false,
  className = '',
  id,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial view year and month from value or today
  const initialDate = useMemo(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Update view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const monthMatrix = useMemo(() => {
    return getMonthMatrix(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  const presets = useMemo(() => {
    return getDatePresets().filter((p) => p.key !== 'all');
  }, []);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (dateStr) => {
    onChange?.(dateStr);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.('');
  };

  const formattedDisplay = value ? formatDateUz(value) : '';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left ${className}`}
      id={id}
    >
      {/* Input Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-2 border bg-surface-900 rounded-xl transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? 'border-primary-500 ring-1 ring-primary-500/50 shadow-sm'
            : 'border-surface-700 hover:border-surface-600'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-primary-500 shrink-0" />
          {formattedDisplay ? (
            <span className="font-semibold text-surface-100 truncate">
              {formattedDisplay}
            </span>
          ) : (
            <span className="text-surface-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-surface-400">
          {clearable && value && !disabled && (
            <span
              onClick={handleClear}
              role="button"
              tabIndex={0}
              className="p-1 rounded-md text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
              title="Sanani o'chirish"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </button>

      {/* Calendar Popup Popover */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-1.5 w-72 rounded-2xl border border-surface-700 bg-surface-900 shadow-2xl p-3 animate-scale-in">
          {/* Quick Presets */}
          {showPresets && (
            <div className="flex items-center gap-1 pb-3 mb-3 border-b border-surface-700/60 overflow-x-auto scrollbar-none">
              {presets.slice(0, 4).map((p) => {
                const isSelected = value === p.from;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleSelectDay(p.from)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-surface-800 text-surface-300 hover:text-surface-100 hover:bg-surface-700'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
              title="Oldingi oy"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-surface-100">
              {UZ_MONTHS[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-surface-400 hover:text-surface-100 hover:bg-surface-800 transition-colors"
              title="Keyingi oy"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {UZ_WEEKDAYS_SHORT.map((wd) => (
              <span key={wd} className="text-[10px] font-bold text-surface-400">
                {wd}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {monthMatrix.map((item) => {
              const isSelected = item.dateStr === value;
              return (
                <button
                  key={item.dateStr}
                  type="button"
                  onClick={() => handleSelectDay(item.dateStr)}
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-primary-600 text-white font-bold shadow-sm'
                      : item.isToday
                      ? 'border border-primary-500 text-primary-500 font-bold'
                      : !item.isCurrentMonth
                      ? 'text-surface-600 hover:bg-surface-800/40'
                      : 'text-surface-200 hover:bg-surface-800 hover:text-surface-100'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Quick "Bugun" action footer */}
          <div className="mt-3 pt-2 border-t border-surface-700/60 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => handleSelectDay(toISODateString(new Date()))}
              className="font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Bugungi sana
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange?.('');
                  setIsOpen(false);
                }}
                className="text-surface-400 hover:text-danger-500 transition-colors"
              >
                Bekor qilish
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
