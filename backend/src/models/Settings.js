const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
 {
  key: {
   type: String,
   required: true,
   unique: true,
   default: 'main',
   immutable: true,
  },
  businessName: {
   type: String,
   trim: true,
   maxlength: 160,
   default: "Bog'ishamol",
  },
  currency: {
   type: String,
   trim: true,
   uppercase: true,
   default: 'UZS',
   maxlength: 3,
  },
  timezone: {
   type: String,
   required: true,
   default: 'Asia/Tashkent',
  },
  defaultLowStockThresholdKg: {
   type: Number,
   min: 0,
   default: 2500,
  },
  telegramEnabled: {
   type: Boolean,
   default: false,
  },
  telegramBotToken: {
   type: String,
   trim: true,
   select: false,
  },
  telegramAdminChatId: {
   type: String,
   trim: true,
  },
  dailyReportEnabled: {
   type: Boolean,
   default: true,
  },
  dailyReportTime: {
   type: String,
   required: true,
   default: '21:00',
   match: /^([01]\d|2[0-3]):[0-5]\d$/,
  },
 },
 { timestamps: true }
);

module.exports = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
