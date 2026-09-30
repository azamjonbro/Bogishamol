const express = require('express');
const Nasiya = require('../models/Nasiya');
const { recordDebtPayment } = require('../services/transactionService');

const router = express.Router();

/**
 * GET /api/nasiya — list debts with filtering, search, pagination and sort
 */
router.get('/', async (req, res) => {
 const filter = {};

 if (['open', 'partial', 'paid'].includes(req.query.status)) {
  filter.status = req.query.status;
 }
 if (req.query.overdue === 'true') {
  filter.status = { $in: ['open', 'partial'] };
  filter.dueDate = { $lt: new Date() };
 }
 if (typeof req.query.search === 'string' && req.query.search.trim()) {
  const escapedSearch = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  filter.$or = [
   { customerName: { $regex: escapedSearch, $options: 'i' } },
   { customerPhone: { $regex: escapedSearch, $options: 'i' } },
  ];
 }

 const parsedLimit = Number.parseInt(req.query.limit, 10);
 const parsedSkip = Number.parseInt(req.query.skip, 10);
 const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;
 const skip = Number.isFinite(parsedSkip) ? Math.max(parsedSkip, 0) : 0;

 // Sort: default by dueDate ascending (earliest due first)
 const allowedSorts = { dueDate: 1, amount: -1, createdAt: -1 };
 const sortField = Object.hasOwn(allowedSorts, req.query.sort) ? req.query.sort : 'dueDate';
 const sortDir = req.query.order === 'desc' ? -1 : (req.query.order === 'asc' ? 1 : allowedSorts[sortField]);

 const [data, total] = await Promise.all([
  Nasiya.find(filter)
   .populate('transaction', 'date reference totalAmount paidAmount type')
   .sort({ [sortField]: sortDir })
   .skip(skip)
   .limit(limit),
  Nasiya.countDocuments(filter),
 ]);

 res.json({ data, pagination: { total, limit, skip } });
});

/**
 * GET /api/nasiya/:id — single debt details
 */
router.get('/:id', async (req, res) => {
 const nasiya = await Nasiya.findById(req.params.id)
  .populate('transaction', 'date reference totalAmount paidAmount type items');
 if (!nasiya) {
  return res.status(404).json({ error: 'Nasiya not found.' });
 }
 return res.json({ data: nasiya });
});

/**
 * POST /api/nasiya/:id/payments — record a debt payment
 */
router.post('/:id/payments', async (req, res) => {
 const nasiya = await recordDebtPayment(req.params.id, req.body);
 res.status(201).json({ data: nasiya });
});

module.exports = router;
