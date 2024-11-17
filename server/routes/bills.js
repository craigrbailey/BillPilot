import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as billOperations from '../database/billOperations.js';
import prisma from '../database/db.js';

const router = express.Router();

// Payee Routes
router.get('/payees', authenticateToken, async (req, res) => {
  try {
    const payees = await billOperations.getPayees(req.user.id);
    res.json(payees);
  } catch (error) {
    console.error('Error fetching payees:', error);
    res.status(500).json({ error: 'Failed to fetch payees' });
  }
});

router.post('/payees', authenticateToken, async (req, res) => {
  try {
    const payee = await billOperations.createPayee(req.user.id, req.body);
    res.status(201).json(payee);
  } catch (error) {
    console.error('Error creating payee:', error);
    res.status(500).json({ error: 'Failed to create payee' });
  }
});

router.put('/payees/:id', authenticateToken, async (req, res) => {
  try {
    const payee = await billOperations.updatePayee(req.user.id, req.params.id, req.body);
    if (!payee) {
      return res.status(404).json({ error: 'Payee not found' });
    }
    res.json(payee);
  } catch (error) {
    console.error('Error updating payee:', error);
    res.status(500).json({ error: 'Failed to update payee' });
  }
});

router.delete('/payees/:id', authenticateToken, async (req, res) => {
  try {
    await billOperations.deletePayee(req.user.id, req.params.id);
    res.json({ message: 'Payee deleted successfully' });
  } catch (error) {
    console.error('Error deleting payee:', error);
    res.status(500).json({ error: 'Failed to delete payee' });
  }
});

// Generate recurring bills for a payee
router.post('/payees/:id/generate-bills', authenticateToken, async (req, res) => {
  try {
    const bills = await billOperations.generateRecurringBills(req.user.id, req.params.id);
    res.json(bills);
  } catch (error) {
    console.error('Error generating bills:', error);
    res.status(500).json({ error: 'Failed to generate bills' });
  }
});

// Bill Routes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bills = await billOperations.getBills(req.user.id);
    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const bill = await billOperations.createBill(req.user.id, req.body);
    res.status(201).json(bill);
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const bill = await billOperations.updateBill(req.user.id, req.params.id, req.body);
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ error: 'Failed to update bill' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await billOperations.deleteBill(req.user.id, req.params.id);
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ error: 'Failed to delete bill' });
  }
});

// Payment Routes
router.post('/:id/pay', authenticateToken, async (req, res) => {
  try {
    const billId = parseInt(req.params.id);
    const { paymentDate } = req.body;
    const userId = req.user.id;

    // Verify the bill belongs to the user
    const bill = await prisma.bill.findFirst({
      where: {
        id: billId,
        userId,
      },
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    // Use a transaction to update both bill and create history
    const result = await prisma.$transaction(async (prisma) => {
      // Update the bill
      const updatedBill = await prisma.bill.update({
        where: { id: billId },
        data: {
          isPaid: true,
          paidDate: new Date(paymentDate),
        },
      });

      // Create payment history record
      const paymentHistory = await prisma.billHistory.create({
        data: {
          billId: billId,
          amount: bill.amount,
          dueDate: bill.dueDate,
          paidDate: new Date(paymentDate),
        },
      });

      return { bill: updatedBill, history: paymentHistory };
    });

    res.json(result);
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    res.status(500).json({ error: 'Failed to mark bill as paid' });
  }
});

router.get('/:id/payments', authenticateToken, async (req, res) => {
  try {
    const payments = await billOperations.getBillPayments(req.user.id, req.params.id);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get upcoming bills
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const bills = await billOperations.getUpcomingBills(req.user.id);
    res.json(bills);
  } catch (error) {
    console.error('Error fetching upcoming bills:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming bills' });
  }
});

// Get overdue bills
router.get('/overdue', authenticateToken, async (req, res) => {
  try {
    const bills = await billOperations.getOverdueBills(req.user.id);
    res.json(bills);
  } catch (error) {
    console.error('Error fetching overdue bills:', error);
    res.status(500).json({ error: 'Failed to fetch overdue bills' });
  }
});

// Get payment history
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const payments = await prisma.billHistory.findMany({
      where: {
        bill: {
          userId: req.user.id,
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

// Delete a payment
router.delete('/payments/:id', authenticateToken, async (req, res) => {
  try {
    const payment = await prisma.billHistory.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        bill: true,
      },
    });

    // Verify the payment belongs to the user
    if (payment.bill.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete the payment
    await prisma.billHistory.delete({
      where: { id: parseInt(req.params.id) },
    });

    // Update the bill's paid status if this was the latest payment
    const latestPayment = await prisma.billHistory.findFirst({
      where: { billId: payment.billId },
      orderBy: { paidDate: 'desc' },
    });

    if (!latestPayment) {
      await prisma.bill.update({
        where: { id: payment.billId },
        data: {
          isPaid: false,
          paidDate: null,
        },
      });
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// Add this route to your existing bills routes
router.get('/payment-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const paymentHistory = await prisma.billHistory.findMany({
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
    res.json(paymentHistory);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

export default router; 