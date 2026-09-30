const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
 {
  date: {
   type: Date,
   required: true,
   default: Date.now,
   index: true,
  },
  category: {
   type: String,
   required: true,
   trim: true,
   maxlength: 80,
  },
  description: {
   type: String,
   trim: true,
   maxlength: 500,
  },
  amount: {
   type: Number,
   required: true,
   min: 0.01,
  },
  paymentMethod: {
   type: String,
   enum: ['cash', 'card', 'transfer'],
   default: 'cash',
  },
  recipient: {
   type: String,
   trim: true,
   maxlength: 120,
  },
  reference: {
   type: String,
   trim: true,
   maxlength: 100,
  },
 },
 { timestamps: true }
);

expenseSchema.index({ date: -1, category: 1 });

module.exports = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
