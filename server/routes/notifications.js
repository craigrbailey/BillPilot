import express from 'express';
import prisma from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get notification settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id },
      select: {
        notifyOnDue: true,
        notifyDaysBefore: true,
        notifyOnPayment: true,
      },
    });

    // If no settings exist, return defaults
    if (!settings) {
      return res.json({
        notifyOnDue: true,
        notifyDaysBefore: 1,
        notifyOnPayment: true,
        providers: {},
        types: {},
      });
    }

    res.json({
      ...settings,
      providers: {
        EMAIL: { isEnabled: false },
        PUSHOVER: { isEnabled: false },
        DISCORD: { isEnabled: false },
        SLACK: { isEnabled: false },
      },
      types: {
        BILL_DUE: { isEnabled: settings.notifyOnDue, days_before: settings.notifyDaysBefore },
        BILL_OVERDUE: { isEnabled: true },
        WEEKLY_SUMMARY: { isEnabled: false },
        MONTHLY_SUMMARY: { isEnabled: false },
      },
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update notification provider settings
router.put('/provider/:providerType', authenticateToken, async (req, res) => {
  try {
    const { providerType } = req.params;
    const settings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: req.body,
      create: {
        userId: req.user.id,
        ...req.body,
      },
    });
    res.json(settings);
  } catch (error) {
    console.error('Error updating notification provider:', error);
    res.status(500).json({ error: 'Failed to update notification provider' });
  }
});

// Update notification type settings
router.put('/type/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const settings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: req.body,
      create: {
        userId: req.user.id,
        ...req.body,
      },
    });
    res.json(settings);
  } catch (error) {
    console.error('Error updating notification type:', error);
    res.status(500).json({ error: 'Failed to update notification type' });
  }
});

// Test notification provider
router.post('/test/:providerType', authenticateToken, async (req, res) => {
  try {
    const { providerType } = req.params;
    // Here you would implement the actual test notification logic
    res.json({ message: `Test notification sent via ${providerType}` });
  } catch (error) {
    console.error('Error testing notification provider:', error);
    res.status(500).json({ error: 'Failed to test notification provider' });
  }
});

export default router; 