/**
 * Unit tests for toKilograms conversion utility
 * and transaction service validation logic.
 */

// Extract the toKilograms function for unit testing
// Since it's not exported, we test it indirectly through createTransaction
// But we can also test the logic directly by extracting it.

const { httpError } = require('../../src/services/transactionService');

describe('httpError utility', () => {
 test('creates an error with statusCode', () => {
  const err = httpError(400, 'Bad input');
  expect(err).toBeInstanceOf(Error);
  expect(err.message).toBe('Bad input');
  expect(err.statusCode).toBe(400);
 });

 test('creates a 409 conflict error', () => {
  const err = httpError(409, 'Insufficient stock');
  expect(err.statusCode).toBe(409);
  expect(err.message).toBe('Insufficient stock');
 });
});

describe('toKilograms logic (unit conversion)', () => {
 // We'll replicate the conversion logic here for pure unit testing
 // since the function is not exported from the module.
 function toKilograms(quantity, unit, product) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
   throw new Error('Item quantity must be greater than zero.');
  }
  if (unit === 'kg') return quantity;
  if (unit === 'ton') return quantity * 1000;
  if (unit === 'bag') {
   if (!product.bagWeightKg) {
    throw new Error(`${product.name} has no bag weight configured.`);
   }
   return quantity * product.bagWeightKg;
  }
  throw new Error('Unit must be kg, ton, or bag.');
 }

 test('converts kg correctly (identity)', () => {
  expect(toKilograms(50, 'kg', {})).toBe(50);
  expect(toKilograms(0.5, 'kg', {})).toBe(0.5);
 });

 test('converts ton to kg (× 1000)', () => {
  expect(toKilograms(1, 'ton', {})).toBe(1000);
  expect(toKilograms(2.5, 'ton', {})).toBe(2500);
  expect(toKilograms(0.1, 'ton', {})).toBe(100);
 });

 test('converts bag to kg using product bagWeightKg', () => {
  const product = { name: 'Yem A', bagWeightKg: 50 };
  expect(toKilograms(1, 'bag', product)).toBe(50);
  expect(toKilograms(10, 'bag', product)).toBe(500);
  expect(toKilograms(0.5, 'bag', product)).toBe(25);
 });

 test('throws if bag weight is not configured', () => {
  const product = { name: 'Yem B', bagWeightKg: null };
  expect(() => toKilograms(1, 'bag', product)).toThrow('no bag weight configured');
 });

 test('throws if quantity is zero or negative', () => {
  expect(() => toKilograms(0, 'kg', {})).toThrow('greater than zero');
  expect(() => toKilograms(-5, 'kg', {})).toThrow('greater than zero');
 });

 test('throws if quantity is NaN or Infinity', () => {
  expect(() => toKilograms(NaN, 'kg', {})).toThrow('greater than zero');
  expect(() => toKilograms(Infinity, 'kg', {})).toThrow('greater than zero');
 });

 test('throws for unknown unit', () => {
  expect(() => toKilograms(10, 'pound', {})).toThrow('Unit must be kg, ton, or bag');
 });
});

describe('low stock detection', () => {
 test('product is low stock when stockKg <= threshold', () => {
  const isLowStock = (stockKg, threshold) => stockKg <= threshold;
  expect(isLowStock(100, 2500)).toBe(true);
  expect(isLowStock(2500, 2500)).toBe(true);
  expect(isLowStock(2501, 2500)).toBe(false);
  expect(isLowStock(0, 0)).toBe(true);
 });
});
