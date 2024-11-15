import express from 'express';
import {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
} from '../database/operations.js';

const router = express.Router();

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
    const bill = await getBillById(req.params.id, userId);
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
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const bill = await deleteBill(req.params.id, userId);
    res.json(bill);
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 