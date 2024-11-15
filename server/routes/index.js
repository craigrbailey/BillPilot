import billRoutes from './bills.js';
import paymentRoutes from './payments.js';
import categoryRoutes from './categories.js';
import authRoutes from './auth.js';
import settingsRoutes from './settings.js';
import incomeRoutes from './income.js';
import { authenticateToken } from '../middleware/auth.js';
import cors from 'cors';
import express from 'express';
import { ensureRecurringItems } from '../services/recurringService.js';

export default function registerRoutes(app) {
  // Enable CORS and JSON parsing
  app.use(cors());
  app.use(express.json());

  // Public routes (no authentication required)
  app.use('/auth', authRoutes);

  // Protected routes (authentication required)
  app.use('/bills', authenticateToken, billRoutes);
  app.use('/payments', authenticateToken, paymentRoutes);
  app.use('/categories', authenticateToken, categoryRoutes);
  app.use('/settings', authenticateToken, settingsRoutes);
  app.use('/income', authenticateToken, incomeRoutes);

  // Add middleware to check recurring items
  app.use(async (req, res, next) => {
    if (req.user) {
      try {
        await ensureRecurringItems(req.user.id);
      } catch (error) {
        console.error('Error checking recurring items:', error);
      }
    }
    next();
  });
} 