/**
 * Integration tests for API endpoints using supertest.
 * These tests require a running MongoDB instance (replica set for transactions).
 * Telegram is mocked — no real messages are sent.
 */

const request = require('supertest');
const mongoose = require('mongoose');
const createApp = require('../../src/app');
const User = require('../../src/models/User');
const Product = require('../../src/models/Product');
const Settings = require('../../src/models/Settings');
const Transaction = require('../../src/models/Transaction');
const Nasiya = require('../../src/models/Nasiya');
const Expense = require('../../src/models/Expense');
const { signToken } = require('../../src/middleware/authMiddleware');

let app;
let adminToken;
let adminUser;

beforeAll(async () => {
 const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yemxona_erp_test';
 await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

 app = createApp();

 // Create admin user
 const passwordHash = await User.hashPassword('testpassword123');
 adminUser = await User.create({
  username: 'testadmin',
  passwordHash,
  fullName: 'Test Admin',
  role: 'admin',
 });
 adminToken = signToken(adminUser);
});

afterAll(async () => {
 // Clean up test data
 await Promise.all([
  User.deleteMany({}),
  Product.deleteMany({}),
  Transaction.deleteMany({}),
  Nasiya.deleteMany({}),
  Expense.deleteMany({}),
  Settings.deleteMany({}),
 ]);
 await mongoose.disconnect();
});

const auth = () => ({ Authorization: `Bearer ${adminToken}` });

describe('Health', () => {
 test('GET /api/health returns ok', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
 });
});

describe('Auth', () => {
 test('POST /api/auth/login with valid credentials returns token', async () => {
  const res = await request(app)
   .post('/api/auth/login')
   .send({ username: 'testadmin', password: 'testpassword123' });
  expect(res.status).toBe(200);
  expect(res.body.data.token).toBeTruthy();
  expect(res.body.data.user.username).toBe('testadmin');
 });

 test('POST /api/auth/login with wrong password returns 401', async () => {
  const res = await request(app)
   .post('/api/auth/login')
   .send({ username: 'testadmin', password: 'wrongpassword' });
  expect(res.status).toBe(401);
 });

 test('POST /api/auth/login with missing fields returns 400', async () => {
  const res = await request(app)
   .post('/api/auth/login')
   .send({ username: 'testadmin' });
  expect(res.status).toBe(400);
 });

 test('GET /api/auth/me with valid token returns user', async () => {
  const res = await request(app)
   .get('/api/auth/me')
   .set(auth());
  expect(res.status).toBe(200);
  expect(res.body.data.username).toBe('testadmin');
 });

 test('GET /api/auth/me without token returns 401', async () => {
  const res = await request(app).get('/api/auth/me');
  expect(res.status).toBe(401);
 });
});

describe('Products', () => {
 let productId;

 test('POST /api/products creates a product', async () => {
  const res = await request(app)
   .post('/api/products')
   .set(auth())
   .send({
    name: 'Buğdoy yemi',
    salePricePerKg: 5000,
    purchasePricePerKg: 4000,
    bagWeightKg: 50,
    lowStockThresholdKg: 1000,
   });
  expect(res.status).toBe(201);
  expect(res.body.data.name).toBe('Buğdoy yemi');
  expect(res.body.data.stockKg).toBe(0);
  productId = res.body.data._id;
 });

 test('GET /api/products returns list', async () => {
  const res = await request(app)
   .get('/api/products')
   .set(auth());
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBeGreaterThanOrEqual(1);
 });

 test('GET /api/products?search=buğdoy finds product', async () => {
  const res = await request(app)
   .get('/api/products?search=buğdoy')
   .set(auth());
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBeGreaterThanOrEqual(1);
 });

 test('GET /api/products?lowStock=true filters low stock', async () => {
  const res = await request(app)
   .get('/api/products?lowStock=true')
   .set(auth());
  expect(res.status).toBe(200);
  // The newly created product has 0 stock < 1000 threshold, so it's low stock
  const found = res.body.data.find((p) => p._id === productId);
  expect(found).toBeTruthy();
 });

 test('PATCH /api/products/:id updates product', async () => {
  const res = await request(app)
   .patch(`/api/products/${productId}`)
   .set(auth())
   .send({ salePricePerKg: 5500 });
  expect(res.status).toBe(200);
  expect(res.body.data.salePricePerKg).toBe(5500);
 });

 test('PATCH /api/products/:id rejects stockKg change', async () => {
  const res = await request(app)
   .patch(`/api/products/${productId}`)
   .set(auth())
   .send({ stockKg: 99999 });
  expect(res.status).toBe(400); // No editable fields
 });

 test('Protected routes reject unauthenticated requests', async () => {
  const res = await request(app).get('/api/products');
  expect(res.status).toBe(401);
 });
});

describe('Settings', () => {
 test('GET /api/settings returns settings without telegram token', async () => {
  const res = await request(app)
   .get('/api/settings')
   .set(auth());
  expect(res.status).toBe(200);
  expect(res.body.data.telegramBotToken).toBeUndefined();
  expect(res.body.data.timezone).toBe('Asia/Tashkent');
 });

 test('PATCH /api/settings updates timezone', async () => {
  const res = await request(app)
   .patch('/api/settings')
   .set(auth())
   .send({ timezone: 'Asia/Samarkand' });
  expect(res.status).toBe(200);
  expect(res.body.data.timezone).toBe('Asia/Samarkand');
 });

 test('PATCH /api/settings does not delete token with empty string', async () => {
  // First, set a token
  await request(app)
   .patch('/api/settings')
   .set(auth())
   .send({ telegramBotToken: 'test-token-123' });

  // Then try to "clear" it with empty string — should NOT delete
  const res = await request(app)
   .patch('/api/settings')
   .set(auth())
   .send({ telegramBotToken: '' });
  // The request should succeed but not include telegramBotToken changes
  expect(res.status).toBe(400); // No editable fields since empty string is rejected
 });
});

describe('Expenses', () => {
 test('POST /api/expenses creates an expense', async () => {
  const res = await request(app)
   .post('/api/expenses')
   .set(auth())
   .send({
    category: 'Transport',
    amount: 500000,
    description: 'Yetkazib berish',
   });
  expect(res.status).toBe(201);
  expect(res.body.data.amount).toBe(500000);
 });

 test('GET /api/expenses returns list', async () => {
  const res = await request(app)
   .get('/api/expenses')
   .set(auth());
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBeGreaterThanOrEqual(1);
 });
});

describe('Error handling', () => {
 test('Invalid ObjectId returns 400', async () => {
  const res = await request(app)
   .get('/api/products/invalid-id')
   .set(auth());
  expect(res.status).toBe(400);
 });

 test('Not found route returns 404', async () => {
  const res = await request(app)
   .get('/api/nonexistent')
   .set(auth());
  expect(res.status).toBe(404);
 });
});
