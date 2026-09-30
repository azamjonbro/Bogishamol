const express = require('express');
const Expense = require('../models/Expense');

const router = express.Router();

router.get('/', async (req, res) => {
 const filter = {};

 if (req.query.category) filter.category = req.query.category;
 if (req.query.from || req.query.to) {
  filter.date = {};

  for (const field of ['from', 'to']) {
   if (!req.query[field]) continue;
   const date = new Date(req.query[field]);
   if (Number.isNaN(date.getTime())) {
    return res.status(400).json({ error: `Invalid ${field} date.` });
   }
   filter.date[field === 'from' ? '$gte' : '$lte'] = date;
  }
 }

 const data = await Expense.find(filter).sort({ date: -1 }).limit(500);
 res.json({ data });
});

router.post('/', async (req, res) => {
 const fields = [
  'date',
  'category',
  'description',
  'amount',
  'paymentMethod',
  'recipient',
  'reference',
 ];
 const expenseData = Object.fromEntries(
  fields
   .filter((field) => Object.hasOwn(req.body, field))
   .map((field) => [field, req.body[field]])
 );

 const expense = await Expense.create(expenseData);
 res.status(201).json({ data: expense });
});

module.exports = router;
