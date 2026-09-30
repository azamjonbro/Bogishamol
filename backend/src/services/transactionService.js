const mongoose = require('mongoose');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Nasiya = require('../models/Nasiya');

const STOCK_DIRECTION = {
  sale: -1,
  purchase: 1,
  sale_return: 1,
  purchase_return: -1,
};

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toKilograms(quantity, unit, product) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw httpError(400, 'Item quantity must be greater than zero.');
  }

  if (unit === 'kg') return quantity;
  if (unit === 'ton') return quantity * 1000;
  if (unit === 'bag') {
    if (!product.bagWeightKg) {
      throw httpError(400, `${product.name} has no bag weight configured.`);
    }
    return quantity * product.bagWeightKg;
  }

  throw httpError(400, 'Unit must be kg, ton, or bag.');
}

/**
 * Execute work in a MongoDB transaction with graceful fallback for standalone MongoDB.
 */
async function runWithTransactionOrFallback(workFn) {
  const session = await mongoose.startSession();
  try {
    let result;
    try {
      await session.withTransaction(async () => {
        result = await workFn(session);
      });
      return result;
    } catch (error) {
      const isStandaloneError =
        error.code === 20 ||
        error.codeName === 'IllegalOperation' ||
        (error.message && error.message.includes('replica set member or mongos'));
      if (isStandaloneError) {
        // Fallback for standalone MongoDB deployments (atomic operations per document)
        return await workFn(null);
      }
      throw error;
    }
  } finally {
    await session.endSession();
  }
}

async function createTransaction(payload) {
  const allowedTypes = [
    'sale',
    'purchase',
    'sale_return',
    'purchase_return',
    'adjustment',
  ];
  if (!allowedTypes.includes(payload.type)) {
    throw httpError(400, 'Unsupported transaction type.');
  }
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw httpError(400, 'Transaction must contain at least one item.');
  }

  return await runWithTransactionOrFallback(async (session) => {
    const productsById = new Map();
    const normalizedItems = [];

    for (const item of payload.items) {
      if (!mongoose.isValidObjectId(item.product)) {
        throw httpError(400, 'Each item must reference a valid product.');
      }

      const productId = String(item.product);
      let product = productsById.get(productId);
      if (!product) {
        const query = Product.findOne({ _id: productId, isActive: true });
        product = session ? await query.session(session) : await query;
        if (!product) throw httpError(404, `Product not found: ${productId}`);
        productsById.set(productId, product);
      }

      const inputUnit = item.inputUnit || 'kg';
      const inputQuantity = Number(item.inputQuantity ?? item.quantityKg);
      const quantityKg = toKilograms(inputQuantity, inputUnit, product);
      const defaultPrice =
        payload.type === 'purchase' || payload.type === 'purchase_return'
          ? product.purchasePricePerKg
          : product.salePricePerKg;
      const unitPricePerKg =
        payload.type === 'adjustment'
          ? 0
          : Number(item.unitPricePerKg ?? defaultPrice);

      if (!Number.isFinite(unitPricePerKg) || unitPricePerKg < 0) {
        throw httpError(400, 'Unit price must be a non-negative number.');
      }

      normalizedItems.push({
        product: product._id,
        inputQuantity,
        inputUnit,
        quantityKg,
        unitPricePerKg,
      });
    }

    const totalAmount = normalizedItems.reduce(
      (total, item) => total + item.quantityKg * item.unitPricePerKg,
      0
    );
    const paidAmount = Number(
      payload.paidAmount ??
      (payload.type === 'sale' && payload.paymentMethod !== 'credit'
        ? totalAmount
        : 0)
    );

    if (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > totalAmount) {
      throw httpError(400, 'Paid amount must be between zero and the transaction total.');
    }

    const stockChanges = new Map();
    for (const item of normalizedItems) {
      let direction = STOCK_DIRECTION[payload.type];
      if (payload.type === 'adjustment') {
        if (!['increase', 'decrease'].includes(payload.adjustmentDirection)) {
          throw httpError(400, 'Adjustment direction must be increase or decrease.');
        }
        direction = payload.adjustmentDirection === 'increase' ? 1 : -1;
      }

      const productId = String(item.product);
      const current = stockChanges.get(productId) || {
        product: item.product,
        quantityKg: 0,
        direction,
      };

      if (current.direction !== direction) {
        throw httpError(400, 'A product cannot have opposite stock movements in one transaction.');
      }
      current.quantityKg += item.quantityKg;
      stockChanges.set(productId, current);
    }

    const updateOptions = session ? { session } : {};

    for (const change of stockChanges.values()) {
      const filter = { _id: change.product };
      if (change.direction < 0) filter.stockKg = { $gte: change.quantityKg };

      const result = await Product.updateOne(
        filter,
        { $inc: { stockKg: change.direction * change.quantityKg } },
        updateOptions
      );

      if (result.modifiedCount !== 1) {
        throw httpError(409, 'Insufficient stock for one or more products.');
      }
    }

    const createOptions = session ? { session } : {};

    const [transaction] = await Transaction.create(
      [
        {
          type: payload.type,
          adjustmentDirection: payload.adjustmentDirection,
          date: payload.date ? new Date(payload.date) : new Date(),
          reference: payload.reference,
          customerName: payload.customerName,
          customerPhone: payload.customerPhone,
          supplierName: payload.supplierName,
          items: normalizedItems,
          paidAmount,
          paymentMethod: payload.paymentMethod,
          notes: payload.notes,
        },
      ],
      createOptions
    );

    if (payload.type === 'sale' && paidAmount < totalAmount) {
      if (!payload.customerName || !payload.dueDate) {
        throw httpError(400, 'Customer name and due date are required for a credit sale.');
      }
      const dueDate = new Date(payload.dueDate);
      if (Number.isNaN(dueDate.getTime())) {
        throw httpError(400, 'Due date is invalid.');
      }

      await Nasiya.create(
        [
          {
            transaction: transaction._id,
            customerName: payload.customerName,
            customerPhone: payload.customerPhone,
            amount: totalAmount - paidAmount,
            dueDate,
            notes: payload.notes,
          },
        ],
        createOptions
      );
    }

    return transaction;
  });
}

async function recordDebtPayment(nasiyaId, payment) {
  if (!mongoose.isValidObjectId(nasiyaId)) {
    throw httpError(400, 'Invalid debt ID.');
  }

  const amount = Number(payment.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw httpError(400, 'Payment amount must be greater than zero.');
  }

  return await runWithTransactionOrFallback(async (session) => {
    const nasiyaQuery = Nasiya.findById(nasiyaId);
    const nasiya = session ? await nasiyaQuery.session(session) : await nasiyaQuery;
    if (!nasiya) throw httpError(404, 'Debt not found.');
    if (amount > nasiya.balanceAmount) {
      throw httpError(400, 'Payment cannot exceed the remaining debt.');
    }

    const txQuery = Transaction.findById(nasiya.transaction);
    const transaction = session ? await txQuery.session(session) : await txQuery;
    if (!transaction) throw httpError(409, 'Linked transaction was not found.');

    nasiya.payments.push({
      amount,
      method: payment.method || 'cash',
      date: payment.date ? new Date(payment.date) : new Date(),
      note: payment.note,
    });

    if (session) {
      await nasiya.save({ session });
    } else {
      await nasiya.save();
    }
    return nasiya;
  });
}

module.exports = {
  createTransaction,
  recordDebtPayment,
  toKilograms,
  httpError,
};
