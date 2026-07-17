const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const locationRoutes = require('./routes/location.routes');
const orderRoutes = require('./routes/order.routes');
const addressRoutes = require('./routes/address.routes');
const paymentRoutes = require('./routes/payment.routes');
const razorpayRoutes = require('./routes/razorpay.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const materialRoutes = require('./routes/material.routes');
const collectionRoutes = require('./routes/collection.routes');
const productFlagsRoutes = require('./routes/product-flags.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/razorpay', razorpayRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/materials', materialRoutes);
app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/product-flags', productFlagsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
