const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
 {
  name: {
   type: String,
   required: true,
   trim: true,
   maxlength: 120,
  },
  sku: {
   type: String,
   trim: true,
   uppercase: true,
   sparse: true,
   unique: true,
   maxlength: 60,
  },
  category: {
   type: String,
   trim: true,
   maxlength: 80,
  },
  stockKg: {
   type: Number,
   required: true,
   default: 0,
   min: 0,
  },
  lowStockThresholdKg: {
   type: Number,
   required: true,
   default: 2500,
   min: 0,
  },
  bagWeightKg: {
   type: Number,
   min: 0.001,
   default: null,
  },
  purchasePricePerKg: {
   type: Number,
   min: 0,
   default: 0,
  },
  salePricePerKg: {
   type: Number,
   min: 0,
   default: 0,
  },
  isActive: {
   type: Boolean,
   default: true,
  },
 },
 { timestamps: true }
);

productSchema.index({ name: 1 });
productSchema.index({ stockKg: 1, lowStockThresholdKg: 1 });

productSchema.virtual('isLowStock').get(function () {
 return this.stockKg <= this.lowStockThresholdKg;
});

module.exports =
 mongoose.models.Product || mongoose.model('Product', productSchema);
