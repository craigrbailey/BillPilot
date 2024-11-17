import express from 'express';
import prisma from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Reset database route
router.post('/reset-database', authenticateToken, async (req, res) => {
  try {
    // Start a transaction to ensure all deletes succeed or none do
    await prisma.$transaction([
      // Delete all bills and related data first
      prisma.billHistory.deleteMany({
        where: { 
          bill: { 
            userId: req.user.id 
          } 
        }
      }),
      prisma.bill.deleteMany({
        where: { 
          userId: req.user.id 
        }
      }),

      // Delete all income data
      prisma.income.deleteMany({
        where: { 
          userId: req.user.id 
        }
      }),

      // Delete categories last
      prisma.category.deleteMany({
        where: { 
          userId: req.user.id 
        }
      }),
    ]);

    res.json({ message: 'Database reset successfully' });
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Get user settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id },
    });
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update user settings
router.put('/', authenticateToken, async (req, res) => {
  try {
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
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router; 