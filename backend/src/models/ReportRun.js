const mongoose = require('mongoose');

const reportRunSchema = new mongoose.Schema(
 {
  reportDate: {
   type: String,
   required: true,
   unique: true,
   match: /^\d{4}-\d{2}-\d{2}$/,
  },
  sentAt: {
   type: Date,
   required: true,
   default: Date.now,
  },
  channel: {
   type: String,
   enum: ['telegram'],
   default: 'telegram',
  },
 },
 { timestamps: true }
);

reportRunSchema.index({ reportDate: 1, channel: 1 }, { unique: true });

module.exports =
 mongoose.models.ReportRun || mongoose.model('ReportRun', reportRunSchema);
