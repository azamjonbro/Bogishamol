const cron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api');
const { DateTime } = require('luxon');
const Settings = require('../models/Settings');
const ReportRun = require('../models/ReportRun');
const { getDailyReport } = require('./reportService');

function formatDailyReport(report) {
 const formatAmount = (amount) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 }).format(amount || 0);
 const lowStockProducts = report.stock.filter((product) => product.isLowStock);
 const lines = [
  `📊 ${report.date} kunlik Bog'ishamol Yemxona hisoboti`,
  '',
  `💰 Savdo: ${formatAmount(report.sales.salesTotal)} UZS`,
  `💵 Tushum: ${formatAmount(report.sales.paidTotal)} UZS`,
  `📝 Nasiya: ${formatAmount(report.sales.creditTotal)} UZS`,
  `✅ Nasiya to\u2018lovlari: ${formatAmount(report.debtCollections.totalAmount)} UZS`,
  `📤 Harajat: ${formatAmount(report.expenses.totalAmount)} UZS`,
  `🔢 Savdolar soni: ${report.sales.transactionCount}`,
  '',
  '🏆 Eng ko\u2018p sotilgan yemlar:',
 ];

 if (report.topProducts.length === 0) {
  lines.push('Bugun savdo yo\u2018q.');
 } else {
  for (const [index, product] of report.topProducts.slice(0, 5).entries()) {
   lines.push(
    `${index + 1}. ${product.name}: ${formatAmount(product.quantityKg)} kg`
   );
  }
 }

 lines.push('', `⚠️ Kam qolgan yemlar: ${lowStockProducts.length}`);
 for (const product of lowStockProducts.slice(0, 10)) {
  lines.push(
   `- ${product.name}: ${formatAmount(product.stockKg)} / ${formatAmount(product.lowStockThresholdKg)} kg`
  );
 }

 return lines.join('\n');
}

async function sendDailyTelegramReport(settings) {
 if (
  !settings.telegramEnabled ||
  !settings.telegramBotToken ||
  !settings.telegramAdminChatId
 ) {
  return false;
 }

 const report = await getDailyReport();
 const bot = new TelegramBot(settings.telegramBotToken, { polling: false });
 await bot.sendMessage(settings.telegramAdminChatId, formatDailyReport(report));
 return true;
}

function startTelegramReportScheduler() {
 return cron.schedule('* * * * *', async () => {
  try {
   const settings = await Settings.findOne({ key: 'main' })
    .select('+telegramBotToken')
    .lean();
   if (!settings?.dailyReportEnabled) return;

   const now = DateTime.now().setZone(settings.timezone || 'Asia/Tashkent');
   if (!now.isValid || now.toFormat('HH:mm') !== settings.dailyReportTime) return;

   const reportDate = now.toISODate();

   // DB-level deduplication: prevent duplicate sends across restarts or instances
   try {
    await ReportRun.create({ reportDate, channel: 'telegram' });
   } catch (err) {
    // Duplicate key means report was already sent today
    if (err.code === 11000) return;
    throw err;
   }

   await sendDailyTelegramReport(settings);
  } catch (error) {
   // Log without exposing sensitive data (token, etc.)
   console.error('Daily Telegram report failed:', error.message);
  }
 }, { timezone: 'UTC' });
}

module.exports = { startTelegramReportScheduler, formatDailyReport };
