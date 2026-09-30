#!/usr/bin/env node

/**
 * Seed script — adds ~11 realistic feed/grain varieties with stock for Yemxona ERP.
 *
 * Usage:
 *   node src/scripts/seedProducts.js
 */

const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

const FEED_PRODUCTS = [
  {
    name: "Oq Bug'doy (1-nav, Rossiya)",
    sku: "BGD-01",
    category: "Bug'doy",
    bagWeightKg: 50,
    purchasePricePerKg: 3200,
    salePricePerKg: 3800,
    stockKg: 15000, // 300 qop / 15 tonna
    lowStockThresholdKg: 3000,
    isActive: true,
  },
  {
    name: "Yemlik Bug'doy (Mahalliy)",
    sku: "BGD-02",
    category: "Bug'doy",
    bagWeightKg: 50,
    purchasePricePerKg: 2700,
    salePricePerKg: 3200,
    stockKg: 8500, // 170 qop
    lowStockThresholdKg: 2000,
    isActive: true,
  },
  {
    name: "Toza Oq Arpa (Qozog'iston)",
    sku: "ARP-01",
    category: "Arpa",
    bagWeightKg: 50,
    purchasePricePerKg: 2900,
    salePricePerKg: 3500,
    stockKg: 12500, // 250 qop
    lowStockThresholdKg: 2500,
    isActive: true,
  },
  {
    name: "Yanchilgan Arpa (Droblyonka)",
    sku: "ARP-02",
    category: "Arpa",
    bagWeightKg: 40,
    purchasePricePerKg: 3100,
    salePricePerKg: 3700,
    stockKg: 6000, // 150 qop
    lowStockThresholdKg: 1500,
    isActive: true,
  },
  {
    name: "Sariq Makka (Donador)",
    sku: "MAK-01",
    category: "Makka",
    bagWeightKg: 50,
    purchasePricePerKg: 3400,
    salePricePerKg: 4000,
    stockKg: 10000, // 200 qop
    lowStockThresholdKg: 2000,
    isActive: true,
  },
  {
    name: "Yoriq Makka (Maydalangan)",
    sku: "MAK-02",
    category: "Makka",
    bagWeightKg: 45,
    purchasePricePerKg: 3600,
    salePricePerKg: 4200,
    stockKg: 4500, // 100 qop
    lowStockThresholdKg: 1500,
    isActive: true,
  },
  {
    name: "Bug'doy Kepagi (Yumshoq, Qozog'iston)",
    sku: "KPK-01",
    category: "Kepak",
    bagWeightKg: 25,
    purchasePricePerKg: 1900,
    salePricePerKg: 2400,
    stockKg: 7500, // 300 qop
    lowStockThresholdKg: 2000,
    isActive: true,
  },
  {
    name: "Paxta Shulxasi (1-nav)",
    sku: "SHL-01",
    category: "Shulxa",
    bagWeightKg: 20,
    purchasePricePerKg: 1400,
    salePricePerKg: 1800,
    stockKg: 5000, // 250 qop
    lowStockThresholdKg: 1500,
    isActive: true,
  },
  {
    name: "Paxta Kunjarasi (Jmıx 42% protein)",
    sku: "KNJ-01",
    category: "Kunjara",
    bagWeightKg: 40,
    purchasePricePerKg: 4300,
    salePricePerKg: 5100,
    stockKg: 3200, // 80 qop
    lowStockThresholdKg: 1000,
    isActive: true,
  },
  {
    name: "Qoramol Semirtirish Kombikormi (Granula)",
    sku: "KMB-01",
    category: "Kombikorm",
    bagWeightKg: 40,
    purchasePricePerKg: 4800,
    salePricePerKg: 5600,
    stockKg: 6400, // 160 qop
    lowStockThresholdKg: 2000,
    isActive: true,
  },
  {
    name: "Tovuq Premiks / Start Omuxta Yem",
    sku: "KMB-02",
    category: "Kombikorm",
    bagWeightKg: 25,
    purchasePricePerKg: 6500,
    salePricePerKg: 7800,
    stockKg: 1200, // 48 qop (Kam qolgan namunasi)
    lowStockThresholdKg: 2000,
    isActive: true,
  },
];

async function seedProducts() {
  await connectDatabase();

  console.log('Seeding products...');
  let addedCount = 0;
  let updatedCount = 0;
  const createdItems = [];

  for (const item of FEED_PRODUCTS) {
    const existing = await Product.findOne({ sku: item.sku });
    if (existing) {
      Object.assign(existing, item);
      await existing.save();
      createdItems.push(existing);
      updatedCount++;
    } else {
      const created = await Product.create(item);
      createdItems.push(created);
      addedCount++;
    }
  }

  console.log(`Products seeded: ${addedCount} added, ${updatedCount} updated.`);

  // Also create an initial inventory intake (Purchase) transaction for audit trail
  const txItems = createdItems.map((p) => ({
    product: p._id,
    quantityKg: p.stockKg,
    inputQuantity: p.bagWeightKg ? Math.round(p.stockKg / p.bagWeightKg) : p.stockKg,
    inputUnit: p.bagWeightKg ? 'bag' : 'kg',
    unitPricePerKg: p.purchasePricePerKg,
    lineTotal: p.stockKg * p.purchasePricePerKg,
  }));

  const totalCost = txItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const existingIntake = await Transaction.findOne({ reference: 'INITIAL_STOCK_SEED' });
  if (!existingIntake) {
    await Transaction.create({
      type: 'purchase',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      reference: 'INITIAL_STOCK_SEED',
      supplierName: "Boshlang'ich ombor zaxirasi",
      items: txItems,
      totalAmount: totalCost,
      paidAmount: totalCost,
      paymentMethod: 'transfer',
      paymentStatus: 'paid',
      notes: "Boshlang'ich ombor qoldig'i (dastlabki zaxira)",
    });
    console.log(`Initial stock intake transaction recorded: total ${totalCost.toLocaleString('uz-UZ')} UZS`);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

seedProducts().catch((err) => {
  console.error('Seed products failed:', err);
  process.exit(1);
});
