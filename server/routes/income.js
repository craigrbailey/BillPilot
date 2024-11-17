import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import prisma from '../database/db.js';
import { addMonths, addWeeks, addDays } from 'date-fns';

const router = express.Router();

// Helper function to generate future payment dates
const generateFuturePaymentDates = (startDate, frequency, months = 6) => {
  const dates = [];
  const endDate = addMonths(new Date(startDate), months);
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    
    switch (frequency) {
      case 'WEEKLY':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'BIWEEKLY':
        currentDate = addWeeks(currentDate, 2);
        break;
      case 'MONTHLY':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'QUARTERLY':
        currentDate = addMonths(currentDate, 3);
        break;
      case 'ANNUAL':
        currentDate = addMonths(currentDate, 12);
        break;
      default:
        break;
    }
  }

  return dates;
};

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

// Get all income sources
router.get('/sources', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sources = await prisma.incomeSource.findMany({
      where: { userId },
    });
    res.json(sources);
  } catch (error) {
    console.error('Error fetching income sources:', error);
    res.status(500).json({ error: 'Failed to fetch income sources' });
  }
});

// Create new income source with future payments
router.post('/sources', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, amount, frequency, startDate, description } = req.body;
    
    // Create the income source
    const source = await prisma.incomeSource.create({
      data: {
        userId,
        name,
        amount: parseFloat(amount),
        frequency,
        startDate: new Date(startDate),
        description,
      },
    });
    
    // Generate future payment entries
    const futureDates = generateFuturePaymentDates(startDate, frequency);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Separate dates into past/today and future
    const pastAndTodayDates = futureDates.filter(date => {
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      return compareDate <= today;
    });

    const futureDatesOnly = futureDates.filter(date => {
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      return compareDate > today;
    });

    // Create entries for past and today's dates as regular entries
    if (pastAndTodayDates.length > 0) {
      await prisma.incomeEntry.createMany({
        data: pastAndTodayDates.map(date => ({
          userId,
          sourceId: source.id,
          amount: parseFloat(amount),
          date,
          description: `Payment from ${name}`,
          isOneTime: false,
          isPending: false,
        })),
      });
    }

    // Create future dates as pending entries
    if (futureDatesOnly.length > 0) {
      await prisma.incomeEntry.createMany({
        data: futureDatesOnly.map(date => ({
          userId,
          sourceId: source.id,
          amount: parseFloat(amount),
          date,
          description: `Scheduled payment from ${name}`,
          isOneTime: false,
          isPending: true,
        })),
      });
    }
    
    res.status(201).json({ 
      source,
      entriesCreated: {
        historical: pastAndTodayDates.length,
        future: futureDatesOnly.length
      }
    });
  } catch (error) {
    console.error('Error creating income source:', error);
    res.status(500).json({ error: 'Failed to create income source' });
  }
});

// Get all income entries (only past and today's entries)
router.get('/entries', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const entries = await prisma.incomeEntry.findMany({
      where: {
        userId,
        isPending: false,
        date: {
          lte: today,
        },
      },
      include: {
        source: true,
      },
      orderBy: {
        date: 'desc', // Most recent first
      },
    });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching income entries:', error);
    res.status(500).json({ error: 'Failed to fetch income entries' });
  }
});

// Create new income entry
router.post('/entries', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sourceId, amount, date, description, isOneTime, sourceName } = req.body;
    
    const entry = await prisma.incomeEntry.create({
      data: {
        userId,
        sourceId: isOneTime ? null : sourceId,
        amount: parseFloat(amount),
        date: new Date(date),
        description,
        isOneTime,
        sourceName: isOneTime ? sourceName : null,
      },
    });
    
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error creating income entry:', error);
    res.status(500).json({ error: 'Failed to create income entry' });
  }
});

// Get future payments (only future pending entries)
router.get('/future-payments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const futurePayments = await prisma.incomeEntry.findMany({
      where: {
        userId,
        isPending: true,
        date: {
          gt: today,
        },
      },
      include: {
        source: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
    res.json(futurePayments);
  } catch (error) {
    console.error('Error fetching future payments:', error);
    res.status(500).json({ error: 'Failed to fetch future payments' });
  }
});

// Update the delete source endpoint to handle all associated records
router.delete('/sources/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sourceId = parseInt(req.params.id);

    // Verify the source belongs to the user
    const source = await prisma.incomeSource.findFirst({
      where: {
        id: sourceId,
        userId,
      },
    });

    if (!source) {
      return res.status(404).json({ error: 'Income source not found' });
    }

    // Use a transaction to ensure all deletions succeed or none do
    await prisma.$transaction(async (prisma) => {
      // Delete all future payments associated with this source
      await prisma.incomeEntry.deleteMany({
        where: {
          sourceId,
          userId,
          isPending: true,
          date: {
            gte: new Date(),
          },
        },
      });

      // Delete all historical payments associated with this source
      await prisma.incomeEntry.deleteMany({
        where: {
          sourceId,
          userId,
          isPending: false,
        },
      });

      // Finally, delete the source itself
      await prisma.incomeSource.delete({
        where: {
          id: sourceId,
        },
      });
    });

    res.json({ 
      message: 'Income source and all associated records deleted successfully',
      deletedSourceId: sourceId
    });
  } catch (error) {
    console.error('Error deleting income source:', error);
    res.status(500).json({ 
      error: 'Failed to delete income source and associated records',
      details: error.message 
    });
  }
});

export default router; 