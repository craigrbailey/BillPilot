import express from 'express';
import {
  addPayment,
  getBillPayments,
} from '../database/operations.js';

const router = express.Router();

// GET payments for a bill
router.get('/:billId/payments', async (req, res) => {
  try {
    const payments = await getBillPayments(req.params.billId);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new payment
router.post('/:billId/payments', async (req, res) => {
  try {
    const payment = await addPayment(req.params.billId, req.body.amount);
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 