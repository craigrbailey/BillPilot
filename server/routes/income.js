import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import prisma from '../database/db.js';

const router = express.Router();

// Get all income entries for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const incomes = await prisma.income.findMany({
      where: { userId },
      include: {
        user: true,
      },
    });
    res.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
});

export default router; 