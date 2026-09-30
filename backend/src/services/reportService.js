const { DateTime } = require('luxon');
const Expense = require('../models/Expense');
const Nasiya = require('../models/Nasiya');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const Transaction = require('../models/Transaction');

function httpError(statusCode, message) {
 const error = new Error(message);
 error.statusCode = statusCode;
 return error;
}

async function getDailyReport(requestedDate) {
 if (
  requestedDate !== undefined &&
  (typeof requestedDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(requestedDate))
 ) {
  throw httpError(400, 'date must use YYYY-MM-DD format.');
 }

 const settings = await Settings.findOne({ key: 'main' }).lean();
 const timezone = settings?.timezone || 'Asia/Tashkent';
 const date =
  requestedDate || DateTime.now().setZone(timezone).toISODate();

 if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  throw httpError(400, 'date must use YYYY-MM-DD format.');
 }

 const localStart = DateTime.fromISO(date, { zone: timezone });
 if (!localStart.isValid || localStart.toISODate() !== date) {
  throw httpError(400, 'Date or configured timezone is invalid.');
 }

 const start = localStart.startOf('day').toUTC().toJSDate();
 const end = localStart.plus({ days: 1 }).startOf('day').toUTC().toJSDate();
 const dateFilter = { $gte: start, $lt: end };

 const [sales, debtCollections, expenses, topProducts, stock] = await Promise.all([
  Transaction.aggregate([
   { $match: { type: 'sale', date: dateFilter } },
   {
    $group: {
     _id: null,
     salesTotal: { $sum: '$totalAmount' },
     paidTotal: { $sum: '$paidAmount' },
     creditTotal: {
      $sum: { $subtract: ['$totalAmount', '$paidAmount'] },
     },
     transactionCount: { $sum: 1 },
    },
   },
   { $project: { _id: 0 } },
  ]),
  Nasiya.aggregate([
   { $unwind: '$payments' },
   { $match: { 'payments.date': dateFilter } },
   {
    $group: {
     _id: null,
     totalAmount: { $sum: '$payments.amount' },
     paymentCount: { $sum: 1 },
    },
   },
   { $project: { _id: 0 } },
  ]),
  Expense.aggregate([
   { $match: { date: dateFilter } },
   {
    $group: {
     _id: '$category',
     totalAmount: { $sum: '$amount' },
     count: { $sum: 1 },
    },
   },
   { $sort: { totalAmount: -1 } },
  ]),
  Transaction.aggregate([
   { $match: { type: 'sale', date: dateFilter } },
   { $unwind: '$items' },
   {
    $group: {
     _id: '$items.product',
     quantityKg: { $sum: '$items.quantityKg' },
     revenue: { $sum: '$items.lineTotal' },
    },
   },
   { $sort: { quantityKg: -1 } },
   { $limit: 10 },
   {
    $lookup: {
     from: Product.collection.name,
     localField: '_id',
     foreignField: '_id',
     as: 'product',
    },
   },
   { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
   {
    $project: {
     _id: 0,
     productId: '$_id',
     name: { $ifNull: ['$product.name', 'Deleted product'] },
     quantityKg: 1,
     revenue: 1,
    },
   },
  ]),
  Product.aggregate([
   { $match: { isActive: true } },
   {
    $project: {
     name: 1,
     sku: 1,
     stockKg: 1,
     lowStockThresholdKg: 1,
     isLowStock: { $lte: ['$stockKg', '$lowStockThresholdKg'] },
    },
   },
   { $sort: { isLowStock: -1, stockKg: 1, name: 1 } },
  ]),
 ]);

 return {
  date,
  timezone,
  period: { from: start.toISOString(), toExclusive: end.toISOString() },
  sales: sales[0] || {
   salesTotal: 0,
   paidTotal: 0,
   creditTotal: 0,
   transactionCount: 0,
  },
  debtCollections: debtCollections[0] || { totalAmount: 0, paymentCount: 0 },
  expenses: {
   totalAmount: expenses.reduce((sum, item) => sum + item.totalAmount, 0),
   categories: expenses,
  },
  topProducts,
  stock,
 };
}

module.exports = { getDailyReport };
