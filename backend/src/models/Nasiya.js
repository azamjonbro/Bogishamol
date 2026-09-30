const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
 {
  amount: {
   type: Number,
   required: true,
   min: 0.01,
  },
  date: {
   type: Date,
   required: true,
   default: Date.now,
  },
  method: {
   type: String,
   enum: ['cash', 'card', 'transfer'],
   default: 'cash',
  },
  note: {
   type: String,
   trim: true,
   maxlength: 300,
  },
 },
 { timestamps: true }
);

const nasiyaSchema = new mongoose.Schema(
 {
  transaction: {
   type: mongoose.Schema.Types.ObjectId,
   ref: 'Transaction',
   required: true,
   unique: true,
  },
  customerName: {
   type: String,
   required: true,
   trim: true,
   maxlength: 120,
  },
  customerPhone: {
   type: String,
   trim: true,
   maxlength: 40,
  },
  amount: {
   type: Number,
   required: true,
   min: 0.01,
  },
  paidAmount: {
   type: Number,
   min: 0,
   default: 0,
  },
  balanceAmount: {
   type: Number,
   min: 0,
   default: 0,
  },
  dueDate: {
   type: Date,
   required: true,
   index: true,
  },
  payments: {
   type: [paymentSchema],
   default: [],
  },
  status: {
   type: String,
   enum: ['open', 'partial', 'paid'],
   default: 'open',
   index: true,
  },
  notes: {
   type: String,
   trim: true,
   maxlength: 1000,
  },
 },
 { timestamps: true }
);

nasiyaSchema.pre('validate', function () {
 this.paidAmount = this.payments.reduce(
  (total, payment) => total + payment.amount,
  0
 );
 this.balanceAmount = Math.max(0, this.amount - this.paidAmount);

 if (this.paidAmount > this.amount) {
  this.invalidate('payments', 'Payments cannot exceed the original debt.');
  return;
 }

 if (this.balanceAmount === 0) {
  this.status = 'paid';
 } else if (this.paidAmount > 0) {
  this.status = 'partial';
 } else {
  this.status = 'open';
 }
});

nasiyaSchema.methods.recordPayment = async function (payment) {
 if (!Number.isFinite(payment.amount) || payment.amount <= 0) {
  throw new Error('Payment amount must be greater than zero.');
 }

 if (this.paidAmount + payment.amount > this.amount) {
  throw new Error('Payment cannot exceed the remaining debt.');
 }

 this.payments.push(payment);
 return this.save();
};

nasiyaSchema.virtual('isOverdue').get(function () {
 return this.status !== 'paid' && this.dueDate < new Date();
});

nasiyaSchema.index({ status: 1, dueDate: 1 });
nasiyaSchema.index({ customerPhone: 1 });

module.exports = mongoose.models.Nasiya || mongoose.model('Nasiya', nasiyaSchema);
