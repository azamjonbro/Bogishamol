const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { requireAuth, requireAdmin } = require('./middleware/authMiddleware');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const nasiyaRoutes = require('./routes/nasiyaRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

function createApp() {
 const app = express();
 const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

 const isDevelopment = process.env.NODE_ENV !== 'production';

 app.disable('x-powered-by');
 app.use(helmet());
 app.use(
  cors({
   origin(origin, callback) {
    if (
     !origin ||
     allowedOrigins.length === 0 ||
     allowedOrigins.includes(origin) ||
     (isDevelopment && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
    ) {
     callback(null, true);
     return;
    }

    callback(new Error('Origin is not allowed by CORS.'));
   },
   credentials: true,
  })
 );
 app.use(express.json({ limit: '1mb' }));
 app.use(express.urlencoded({ extended: true, limit: '1mb' }));
 app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

 // Public routes
 app.use('/api/health', healthRoutes);
 app.use('/api/auth', authRoutes);

 // Protected routes (require JWT)
 app.use('/api/products', requireAuth, productRoutes);
 app.use('/api/transactions', requireAuth, transactionRoutes);
 app.use('/api/nasiya', requireAuth, nasiyaRoutes);
 app.use('/api/expenses', requireAuth, expenseRoutes);
 app.use('/api/reports', requireAuth, reportRoutes);
 app.use('/api/settings', requireAuth, requireAdmin, settingsRoutes);

 app.use(notFoundHandler);
 app.use(errorHandler);

 return app;
}

module.exports = createApp;
