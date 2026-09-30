const express = require('express');
const Transaction = require('../models/Transaction');
const { createTransaction } = require('../services/transactionService');

const router = express.Router();

router.get('/', async (req, res) => {
 const filter = {};

 if (req.query.type) filter.type = req.query.type;
 if (req.query.from || req.query.to) {
  filter.date = {};
  if (req.query.from) {
   const from = new Date(req.query.from);
   if (Number.isNaN(from.getTime())) {
    return res.status(400).json({ error: 'Invalid from date.' });
   }
   filter.date.$gte = from;
  }
  if (req.query.to) {
   const to = new Date(req.query.to);
   if (Number.isNaN(to.getTime())) {
    return res.status(400).json({ error: 'Invalid to date.' });
   }
   filter.date.$lte = to;
  }
 }

 const parsedLimit = Number.parseInt(req.query.limit, 10);
 const parsedSkip = Number.parseInt(req.query.skip, 10);
 const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 100) : 50;
 const skip = Number.isFinite(parsedSkip) ? Math.max(parsedSkip, 0) : 0;

 const [data, total] = await Promise.all([
  Transaction.find(filter)
   .populate('items.product', 'name sku')
   .sort({ date: -1, _id: -1 })
   .skip(skip)
   .limit(limit),
  Transaction.countDocuments(filter),
 ]);

 res.json({ data, pagination: { total, limit, skip } });
});

router.post('/', async (req, res) => {
 const transaction = await createTransaction(req.body);
 await transaction.populate('items.product', 'name sku');
 res.status(201).json({ data: transaction });
});

router.get('/:id', async (req, res) => {
 const transaction = await Transaction.findById(req.params.id).populate(
  'items.product',
  'name sku'
 );
 if (!transaction) {
  return res.status(404).json({ error: 'Transaction not found.' });
 }
 return res.json({ data: transaction });
});

module.exports = router;
