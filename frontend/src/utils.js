/**
 * Format number as UZS currency (e.g., 15 000 000)
 */
export function formatUZS(amount) {
  if (!Number.isFinite(amount)) return '0';
  return new Intl.NumberFormat('uz-UZ', {
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with unit (e.g., 1 500 kg)
 */
export function formatKg(kg) {
  if (!Number.isFinite(kg)) return '0 kg';
  return `${new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 1 }).format(kg)} kg`;
}

/**
 * Format date to locale string
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format date and time
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get error message from API error response
 */
export function getErrorMessage(error) {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'Noma\'lum xatolik yuz berdi.';
}

/**
 * Transaction type labels in Uzbek
 */
export const TRANSACTION_TYPES = {
  sale: 'Savdo',
  purchase: 'Xarid',
  sale_return: 'Qaytim (savdo)',
  purchase_return: 'Qaytim (xarid)',
  adjustment: 'Tuzatish',
};

/**
 * Payment method labels in Uzbek
 */
export const PAYMENT_METHODS = {
  cash: 'Naqd',
  card: 'Karta',
  transfer: 'O\'tkazma',
  mixed: 'Aralash',
  credit: 'Nasiya',
};

/**
 * Nasiya status labels
 */
export const NASIYA_STATUSES = {
  open: 'Ochiq',
  partial: 'Qisman',
  paid: 'To\'langan',
};

// Re-export calendar and date utilities
export * from './utils/dateUtils';

// Re-export select and multi-select utilities
export * from './utils/selectUtils';
