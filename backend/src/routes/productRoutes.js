const express = require('express');
const Product = require('../models/Product');

const router = express.Router();
const editableFields = [
 'name',
 'sku',
 'category',
 'lowStockThresholdKg',
 'bagWeightKg',
 'purchasePricePerKg',
 'salePricePerKg',
];

function pickEditableFields(body) {
 return Object.fromEntries(
  editableFields
   .filter((field) => Object.hasOwn(body, field))
   .map((field) => [field, body[field]])
 );
}

router.get('/', async (req, res) => {
 const filter = {};

 if (req.query.active !== 'all') filter.isActive = req.query.active !== 'false';
 if (req.query.lowStock === 'true') {
  filter.$expr = { $lte: ['$stockKg', '$lowStockThresholdKg'] };
 }
 if (typeof req.query.search === 'string' && req.query.search.trim()) {
  const escapedSearch = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  filter.$or = [
   { name: { $regex: escapedSearch, $options: 'i' } },
   { sku: { $regex: escapedSearch, $options: 'i' } },
   { category: { $regex: escapedSearch, $options: 'i' } },
  ];
 }

 const products = await Product.find(filter).sort({ name: 1 }).limit(500);
 res.json({ data: products });
});

router.post('/', async (req, res) => {
 const product = await Product.create(pickEditableFields(req.body));
 res.status(201).json({ data: product });
});

router.get('/:id', async (req, res) => {
 const product = await Product.findById(req.params.id);
 if (!product) return res.status(404).json({ error: 'Product not found.' });
 return res.json({ data: product });
});

router.patch('/:id', async (req, res) => {
 const changes = pickEditableFields(req.body);
 if (Object.keys(changes).length === 0) {
  return res.status(400).json({ error: 'No editable product fields provided.' });
 }

 const product = await Product.findByIdAndUpdate(req.params.id, changes, {
  new: true,
  runValidators: true,
 });
 if (!product) return res.status(404).json({ error: 'Product not found.' });
 return res.json({ data: product });
});

router.delete('/:id', async (req, res) => {
 const product = await Product.findByIdAndUpdate(
  req.params.id,
  { isActive: false },
  { new: true }
 );
 if (!product) return res.status(404).json({ error: 'Product not found.' });
 return res.json({ data: product });
});

module.exports = router;
