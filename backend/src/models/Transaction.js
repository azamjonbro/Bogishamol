const mongoose = require('mongoose');

const transactionItemSchema = new mongoose.Schema(
 {
  product: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Product',
   required: true,
  },
  // Inventory quantities are always stored in kilograms.
  quantityKg: {
   type: Number,
   required: true,
   min: 0.001,
  },
  inputQuantity: {
   type: Number,
   min: 0.001,
  },
  inputUnit: {
   type: String,
   enum: ['kg', 'ton', 'bag'],
   default: 'kg',
  },
  unitPricePerKg: {
   type: Number,
   required: true,
   min: 0,
   default: 0,
  },
  lineTotal: {
   type: Number,
   required: true,
   min: 0,
   default: 0,
  },
 },
 { _id: false }
);

const transactionSchema = new mongoose.Schema(
 {
  type: {
   type: String,
   required: true,
   enum: ['sale', 'purchase', 'sale_return', 'purchase_return', 'adjustment'],
  },
  adjustmentDirection: {
   type: String,
   enum: ['increase', 'decrease'],
   required: function () {
    return this.type === 'adjustment';
   },
  },
  date: {
   type: Date,
   required: true,
   default: Date.now,
   index: true,
  },
  reference: {
   type: String,
   trim: true,
   maxlength: 100,
  },
  customerName: {
   type: String,
   trim: true,
   maxlength: 120,
  },
  customerPhone: {
   type: String,
   trim: true,
   maxlength: 40,
  },
  supplierName: {
   type: String,
   trim: true,
   maxlength: 120,
  },
  items: {
   type: [transactionItemSchema],
   required: true,
   validate: {
    validator: (items) => items.length > 0,
    message: 'Transaction must contain at least one item.',
   },
  },
  totalAmount: {
   type: Number,
   required: true,
   min: 0,
   default: 0,
  },
  paidAmount: {
   type: Number,
   required: true,
   min: 0,
   default: 0,
  },
  paymentStatus: {
   type: String,
   enum: ['not_applicable', 'unpaid', 'partial', 'paid'],
   default: 'unpaid',
  },
  paymentMethod: {
   type: String,
   enum: ['cash', 'card', 'transfer', 'mixed', 'credit'],
  },
  notes: {
   type: String,
   trim: true,
   maxlength: 1000,
  },
 },
 { timestamps: true }
);

transactionSchema.pre('validate', function () {
 for (const item of this.items) {
  item.lineTotal = item.quantityKg * item.unitPricePerKg;
 }

 this.totalAmount =
  this.type === 'adjustment'
   ? 0
   : this.items.reduce((total, item) => total + item.lineTotal, 0);

 if (this.type === 'adjustment') {
  this.paymentStatus = 'not_applicable';
  this.paidAmount = 0;
  return;
 }

 if (this.paidAmount > this.totalAmount) {
  this.invalidate('paidAmount', 'Paid amount cannot exceed transaction total.');
  return;
 }

 if (this.paidAmount === 0) {
  this.paymentStatus = 'unpaid';
 } else if (this.paidAmount < this.totalAmount) {
  this.paymentStatus = 'partial';
 } else {
  this.paymentStatus = 'paid';
 }
});

transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ 'items.product': 1, date: -1 });
transactionSchema.index({ customerName: 1, date: -1 });

module.exports =
 mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
