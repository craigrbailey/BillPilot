import express from 'express';
import prisma from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { addWeeks, addMonths, startOfDay } from 'date-fns';

const router = express.Router();

// Check and generate recurring items
router.get('/check-recurring', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = startOfDay(new Date());

    // Check recurring bills
    const recurringBills = await prisma.bill.findMany({
      where: {
        userId,
        isOneTime: false,
        dueDate: {
          lte: today,
        },
        isPaid: false,
      },
    });

    // Generate next bills
    for (const bill of recurringBills) {
      const nextDate = bill.frequency === 'WEEKLY' 
        ? addWeeks(bill.dueDate, 1)
        : addMonths(bill.dueDate, 1);

      await prisma.bill.update({
        where: { id: bill.id },
        data: { dueDate: nextDate },
      });
    }

    // Check recurring income
    const recurringIncome = await prisma.income.findMany({
      where: {
        userId,
        isRecurring: true,
        nextPayDate: {
          lte: today,
        },
      },
    });

    // Generate next income dates
    for (const income of recurringIncome) {
      const nextDate = income.frequency === 'WEEKLY'
        ? addWeeks(income.nextPayDate, 1)
        : income.frequency === 'BIWEEKLY'
        ? addWeeks(income.nextPayDate, 2)
        : addMonths(income.nextPayDate, 1);

      await prisma.income.update({
        where: { id: income.id },
        data: { nextPayDate: nextDate },
      });
    }

    res.json({ message: 'Recurring items checked and updated' });
  } catch (error) {
    console.error('Error checking recurring items:', error);
    res.status(500).json({ error: 'Failed to check recurring items' });
  }
});

export default router; 