const express = require('express');
const Settings = require('../models/Settings');

const router = express.Router();

// Telegram-sensitive fields that must NEVER appear in responses
const HIDDEN_FIELDS = ['telegramBotToken'];

function stripHiddenFields(settingsObj) {
 const result = { ...settingsObj };
 for (const field of HIDDEN_FIELDS) {
  delete result[field];
 }
 delete result.__v;
 return result;
}

/**
 * GET /api/settings — read current settings (without secrets)
 */
router.get('/', async (req, res) => {
 let settings = await Settings.findOne({ key: 'main' }).lean();
 if (!settings) {
  settings = await Settings.create({ key: 'main' });
  settings = settings.toObject();
 }
 return res.json({ data: stripHiddenFields(settings) });
});

/**
 * PATCH /api/settings — update settings (admin only)
 * Telegram bot token is only updated if explicitly provided and non-empty.
 */
router.patch('/', async (req, res) => {
 const editableFields = [
  'businessName',
  'currency',
  'timezone',
  'defaultLowStockThresholdKg',
  'telegramEnabled',
  'telegramAdminChatId',
  'dailyReportEnabled',
  'dailyReportTime',
 ];

 const changes = {};
 for (const field of editableFields) {
  if (Object.hasOwn(req.body, field)) {
   changes[field] = req.body[field];
  }
 }

 // Only update telegram token if explicitly provided AND non-empty
 // Prevents accidental deletion of existing token
 if (
  Object.hasOwn(req.body, 'telegramBotToken') &&
  typeof req.body.telegramBotToken === 'string' &&
  req.body.telegramBotToken.trim().length > 0
 ) {
  changes.telegramBotToken = req.body.telegramBotToken.trim();
 }

 if (Object.keys(changes).length === 0) {
  return res.status(400).json({ error: 'No editable settings fields provided.' });
 }

 let settings = await Settings.findOneAndUpdate(
  { key: 'main' },
  { $set: changes },
  { new: true, upsert: true, runValidators: true }
 ).lean();

 return res.json({ data: stripHiddenFields(settings) });
});

module.exports = router;
