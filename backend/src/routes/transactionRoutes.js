const express = require('express');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const Nasiya = require('../models/Nasiya');
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

router.patch('/:id', async (req, res) => {
 const transaction = await Transaction.findById(req.params.id);
 if (!transaction) {
  return res.status(404).json({ error: 'Tranzaksiya topilmadi.' });
 }

 const {
  customerName,
  customerPhone,
  supplierName,
  supplierPhone,
  paymentMethod,
  paidAmount,
  notes,
  date,
  dueDate,
 } = req.body;

 if (customerName !== undefined) transaction.customerName = customerName.trim();
 if (customerPhone !== undefined) transaction.customerPhone = customerPhone.trim();
 if (supplierName !== undefined) transaction.supplierName = supplierName.trim();
 if (supplierPhone !== undefined) transaction.supplierPhone = supplierPhone.trim();
 if (paymentMethod !== undefined) transaction.paymentMethod = paymentMethod;
 if (notes !== undefined) transaction.notes = notes;

 if (date) {
  const parsedDate = new Date(date);
  if (!Number.isNaN(parsedDate.getTime())) {
   transaction.date = parsedDate;
  }
 }

 if (paidAmount !== undefined && Number.isFinite(Number(paidAmount))) {
  const numPaid = Number(paidAmount);
  if (numPaid < 0 || numPaid > transaction.totalAmount) {
   return res.status(400).json({ error: "To'langan summa 0 dan katta va umumiy summadan oshmasligi kerak." });
  }
  transaction.paidAmount = numPaid;
  if (numPaid === 0) {
   transaction.paymentStatus = 'unpaid';
  } else if (numPaid < transaction.totalAmount) {
   transaction.paymentStatus = 'partial';
  } else {
   transaction.paymentStatus = 'paid';
  }
 }

 await transaction.save();

 // Sync with linked Nasiya if exists
 const linkedNasiya = await Nasiya.findOne({ transaction: transaction._id });
 if (linkedNasiya) {
  if (customerName !== undefined) linkedNasiya.customerName = customerName.trim();
  if (customerPhone !== undefined) linkedNasiya.customerPhone = customerPhone.trim();
  if (notes !== undefined) linkedNasiya.notes = notes;
  if (dueDate) {
   const parsedDueDate = new Date(dueDate);
   if (!Number.isNaN(parsedDueDate.getTime())) {
    linkedNasiya.dueDate = parsedDueDate;
   }
  }
  if (paidAmount !== undefined) {
   const remainingDebt = transaction.totalAmount - transaction.paidAmount;
   linkedNasiya.amount = remainingDebt;
   if (remainingDebt <= 0) {
    linkedNasiya.status = 'paid';
   } else if (linkedNasiya.status === 'paid' && remainingDebt > 0) {
    linkedNasiya.status = 'active';
   }
  }
  await linkedNasiya.save();
 }

 await transaction.populate('items.product', 'name sku');
 res.json({ data: transaction });
});

router.delete('/:id', async (req, res) => {
 const transaction = await Transaction.findById(req.params.id);
 if (!transaction) {
  return res.status(404).json({ error: 'Tranzaksiya topilmadi.' });
 }

 const STOCK_REVERSAL = {
  sale: 1,
  purchase: -1,
  sale_return: -1,
  purchase_return: 1,
 };

 const direction = STOCK_REVERSAL[transaction.type];
 if (direction && Array.isArray(transaction.items)) {
  for (const item of transaction.items) {
   if (item.product && item.quantityKg) {
    await Product.findByIdAndUpdate(item.product, {
     $inc: { stockKg: direction * item.quantityKg },
    });
   }
  }
 }

 await Nasiya.deleteMany({ transaction: transaction._id });
 await Transaction.findByIdAndDelete(req.params.id);

 res.json({ message: "Tranzaksiya muvaffaqiyatli o'chirildi va ombor qoldig'i qaytarildi." });
});

module.exports = router;

