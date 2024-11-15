import express from 'express';
import prisma from '../database/db.js';
import {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  markBillAsPaid,
  getPaymentHistory,
  clearUserCache,
} from '../database/operations.js';
import { authenticateToken } from '../middleware/auth.js';
import { cacheService, CACHE_KEYS } from '../services/cacheService.js';

const router = express.Router();

// IMPORTANT: Move the payments route to the top, before any routes with parameters
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await prisma.payment.findMany({
      where: {
        bill: {
          userId: userId,
        },
      },
      include: {
        bill: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        paidDate: 'desc',
      },
    });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Create new bill
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validate request body
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    // Create the bill
    const bill = await createBill(req.body, userId);
    res.json(bill);
  } catch (error) {
    console.error('Error creating bill:', error);
    
    // Handle specific error cases
    if (error.message.includes('Missing required fields')) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (error.message.includes('Invalid numeric values')) {
      return res.status(400).json({ error: 'Invalid numeric values provided' });
    }
    if (error.message.includes('Invalid date')) {
      return res.status(400).json({ error: 'Invalid date provided' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    // Generic error response
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

// Get all bills
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const bills = await getAllBills(userId);
    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single bill
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const billId = parseInt(req.params.id);
    
    if (isNaN(billId)) {
      return res.status(400).json({ error: 'Invalid bill ID' });
    }

    const bill = await getBillById(billId, userId);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update bill
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const bill = await updateBill(req.params.id, req.body, userId);
    res.json(bill);
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete bill
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const billId = parseInt(req.params.id);
    const deleteAll = req.query.deleteAll === 'true';
    
    await deleteBill(billId, userId, deleteAll);
    res.json({ message: 'Bill(s) deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add this new route for marking bills as paid
router.post('/:id/paid', async (req, res) => {
  try {
    const userId = req.user.id;
    const billId = parseInt(req.params.id);

    // First verify the bill belongs to the user
    const bill = await prisma.bill.findFirst({
      where: {
        id: billId,
        userId: userId,
      },
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: {
        isPaid: true,
      },
      include: {
        category: true,
      },
    });

    res.json(updatedBill);
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    res.status(500).json({ error: 'Failed to mark bill as paid' });
  }
});

// Update the mark as paid route
router.put('/:id/pay', authenticateToken, async (req, res) => {
  try {
    const billId = parseInt(req.params.id);
    const userId = req.user.id;
    const { paidDate } = req.body;
    
    if (isNaN(billId)) {
      return res.status(400).json({ error: 'Invalid bill ID' });
    }

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // First verify the bill belongs to the user
      const bill = await prisma.bill.findFirst({
        where: {
          id: billId,
          userId: userId,
        },
      });

      if (!bill) {
        throw new Error('Bill not found or access denied');
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          amount: bill.amount,
          paidDate: paidDate ? new Date(paidDate) : new Date(),
          billId: billId,
        },
      });

      // Update bill status
      const updatedBill = await prisma.bill.update({
        where: { id: billId },
        data: {
          isPaid: true,
          paidDate: payment.paidDate,
        },
        include: {
          category: true,
        },
      });

      return { bill: updatedBill, payment };
    });

    res.json(result);
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update the payment deletion route
router.delete('/payments/:id', authenticateToken, async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    const userId = req.user.id;

    // First verify the payment belongs to the user's bill
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        bill: {
          userId: userId,
        },
      },
      include: {
        bill: true,
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Start a transaction to delete payment and update bill
    await prisma.$transaction(async (prisma) => {
      // Delete the payment
      await prisma.payment.delete({
        where: { id: paymentId },
      });

      // Count remaining payments for this bill
      const remainingPayments = await prisma.payment.count({
        where: { billId: payment.bill.id },
      });

      // If this was the last payment, update bill status
      if (remainingPayments === 0) {
        await prisma.bill.update({
          where: { id: payment.bill.id },
          data: {
            isPaid: false,
            paidDate: null,
          },
        });
      }
    });

    // Clear relevant cache
    cacheService.delete(CACHE_KEYS.PAYMENTS(userId));
    cacheService.delete(CACHE_KEYS.BILLS(userId));

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// Add a route to manually clear cache if needed
router.post('/clear-cache', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    clearUserCache(userId);
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

export default router; 