/**
 * Unit tests for Telegram report formatter
 */

const { formatDailyReport } = require('../../src/services/telegramReportService');

// uz-UZ locale uses non-breaking spaces (\u00a0) in formatted numbers.
// Normalize all whitespace to regular spaces for easier comparison.
const normalize = (text) => text.replace(/\u00a0/g, ' ');

describe('formatDailyReport', () => {
 const baseReport = {
  date: '2024-06-15',
  timezone: 'Asia/Tashkent',
  sales: {
   salesTotal: 15000000,
   paidTotal: 10000000,
   creditTotal: 5000000,
   transactionCount: 12,
  },
  debtCollections: { totalAmount: 3000000, paymentCount: 3 },
  expenses: { totalAmount: 2000000, categories: [] },
  topProducts: [
   { name: 'Buğdoy yemi', quantityKg: 5000, revenue: 7500000 },
   { name: 'Makkajo\'xori', quantityKg: 3000, revenue: 6000000 },
  ],
  stock: [
   { name: 'Buğdoy yemi', stockKg: 100, lowStockThresholdKg: 2500, isLowStock: true },
   { name: 'Makkajo\'xori', stockKg: 5000, lowStockThresholdKg: 2500, isLowStock: false },
  ],
 };

 test('includes date in the header', () => {
  const text = formatDailyReport(baseReport);
  expect(text).toContain('2024-06-15');
 });

 test('includes sales total formatted', () => {
  const text = normalize(formatDailyReport(baseReport));
  expect(text).toContain('15 000 000');
  expect(text).toContain('UZS');
 });

 test('includes top products', () => {
  const text = formatDailyReport(baseReport);
  expect(text).toContain('Buğdoy yemi');
  expect(text).toContain('Makkajo\'xori');
 });

 test('shows low stock count and products', () => {
  const text = formatDailyReport(baseReport);
  expect(text).toContain('Kam qolgan yemlar: 1');
  expect(text).toContain('Buğdoy yemi');
 });

 test('shows "no sales" when topProducts is empty', () => {
  const noSalesReport = {
   ...baseReport,
   topProducts: [],
  };
  const text = formatDailyReport(noSalesReport);
  expect(text).toContain('savdo yo\u2018q');
 });

 test('includes debt collections', () => {
  const text = normalize(formatDailyReport(baseReport));
  expect(text).toContain('3 000 000');
 });

 test('includes expense total', () => {
  const text = normalize(formatDailyReport(baseReport));
  expect(text).toContain('2 000 000');
 });

 test('includes transaction count', () => {
  const text = formatDailyReport(baseReport);
  expect(text).toContain('12');
 });
});
