import billRoutes from './bills.js';
import paymentRoutes from './payments.js';
import categoryRoutes from './categories.js';
import authRoutes from './auth.js';
import settingsRoutes from './settings.js';
import incomeRoutes from './income.js';
import { authenticateUser } from '../middleware/auth.js';

export default function registerRoutes(app) {
  // Public routes
  app.use('/auth', authRoutes);

  // Protected routes
  app.use('/bills', authenticateUser, billRoutes);
  app.use('/bills', authenticateUser, paymentRoutes);
  app.use('/categories', authenticateUser, categoryRoutes);
  app.use('/settings', authenticateUser, settingsRoutes);
  app.use('/income', authenticateUser, incomeRoutes);
} 