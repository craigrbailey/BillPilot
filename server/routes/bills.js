import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as billOperations from '../database/billOperations.js';

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
    const payment = await billOperations.addPayment(req.user.id, req.params.id, req.body);
    res.json(payment);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ error: 'Failed to add payment' });
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

export default router; 