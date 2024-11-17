import express from 'express';
import authRoutes from './auth.js';
import billRoutes from './bills.js';
import incomeRoutes from './income.js';
import categoryRoutes from './categories.js';
import notificationRoutes from './notifications.js';
import settingsRoutes from './settings.js';
import payeeRoutes from './payees.js';
import recurringRoutes from './recurring.js';

const registerRoutes = (app) => {
  // Mount all routes under /api prefix
  app.use('/api/auth', authRoutes);
  app.use('/api/bills', billRoutes);
  app.use('/api/income', incomeRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/settings/notifications', notificationRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/payees', payeeRoutes);
  app.use('/api', recurringRoutes);
};

export default registerRoutes; 