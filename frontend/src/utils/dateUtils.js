/**
 * Yemxona ERP — Calendar & Date Utilities (Uzbek Localization)
 */

export const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

export const UZ_MONTHS_GENITIVE = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
];

export const UZ_WEEKDAYS_SHORT = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];
export const UZ_WEEKDAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

/**
 * Format a Date object or timestamp into YYYY-MM-DD string in local time
 */
export function toISODateString(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date string into human-readable Uzbek format (e.g., "30-sentabr, 2026")
 */
export function formatDateUz(dateInput) {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = UZ_MONTHS_GENITIVE[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}, ${year}`;
}

/**
 * Format date & time into Uzbek format (e.g., "30-sentabr, 16:45")
 */
export function formatDateTimeUz(dateInput) {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = UZ_MONTHS_GENITIVE[d.getMonth()];
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${month}, ${hours}:${minutes}`;
}

/**
 * Get relative human time in Uzbek (Bugun, Kecha, Yoki sana)
 */
export function getRelativeDateUz(dateInput) {
  if (!dateInput) return '';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const today = new Date();
  const todayStr = toISODateString(today);
  const targetStr = toISODateString(d);

  if (targetStr === todayStr) return 'Bugun';

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (targetStr === toISODateString(yesterday)) return 'Kecha';

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (targetStr === toISODateString(tomorrow)) return 'Ertaga';

  return formatDateUz(d);
}

/**
 * Quick date presets commonly used in ERP reports, transactions, cashiering
 */
export function getDatePresets() {
  const now = new Date();

  // Today
  const today = toISODateString(now);

  // Yesterday
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  const yesterday = toISODateString(yest);

  // This Week (Monday of this week to today)
  const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const monday = new Date(now);
  monday.setDate(monday.getDate() - dayOfWeek);
  const thisWeekStart = toISODateString(monday);

  // Last 7 days
  const last7 = new Date(now);
  last7.setDate(last7.getDate() - 6);
  const last7DaysStart = toISODateString(last7);

  // This Month (1st of month to today)
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthStart = toISODateString(firstOfMonth);

  // Last Month
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthStart = toISODateString(firstOfLastMonth);
  const lastMonthEnd = toISODateString(lastOfLastMonth);

  return [
    { key: 'today', label: 'Bugun', from: today, to: today },
    { key: 'yesterday', label: 'Kecha', from: yesterday, to: yesterday },
    { key: 'this_week', label: 'Bu hafta', from: thisWeekStart, to: today },
    { key: 'last_7_days', label: '7 kun', from: last7DaysStart, to: today },
    { key: 'this_month', label: 'Bu oy', from: thisMonthStart, to: today },
    { key: 'last_month', label: 'O\'tgan oy', from: lastMonthStart, to: lastMonthEnd },
    { key: 'all', label: 'Barchasi', from: '', to: '' },
  ];
}

/**
 * Generate 35 or 42 calendar grid cells for a given month & year
 */
export function getMonthMatrix(year, month) {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const prevLastDay = new Date(year, month, 0);

  // Monday is 0 in Uzbek calendar
  const startDay = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const prevMonthTotalDays = prevLastDay.getDate();

  const days = [];
  const todayStr = toISODateString(new Date());

  // Days from previous month
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const d = new Date(year, month - 1, dayNum);
    const dateStr = toISODateString(d);
    days.push({
      day: dayNum,
      dateStr,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Days of current month
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = toISODateString(dateObj);
    days.push({
      day: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Trailing days from next month to complete the row
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const dateObj = new Date(year, month + 1, d);
      const dateStr = toISODateString(dateObj);
      days.push({
        day: d,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }
  }

  return days;
}
