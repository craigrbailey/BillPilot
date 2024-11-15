import express from 'express';
import {
  createIncome,
  getAllIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
  markIncomePaid,
} from '../database/incomeOperations.js';

const router = express.Router();

// Create new income
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const income = await createIncome(req.body, userId);
    res.json(income);
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all incomes
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const incomes = await getAllIncomes(userId);
    res.json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single income
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const income = await getIncomeById(req.params.id, userId);
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update income
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const income = await updateIncome(req.params.id, req.body, userId);
    res.json(income);
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete income
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const income = await deleteIncome(req.params.id, userId);
    res.json(income);
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark income as paid
router.post('/:id/paid', async (req, res) => {
  try {
    const userId = req.user.id;
    const income = await markIncomePaid(req.params.id, userId);
    res.json(income);
  } catch (error) {
    console.error('Error marking income as paid:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 