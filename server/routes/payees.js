import express from 'express';
import prisma from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all payees for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      where: { 
        userId: req.user.id,
        isOneTime: false,
      },
      select: {
        id: true,
        name: true,
        amount: true,
        category: true,
        dueDate: true,
        description: true,
      },
      distinct: ['name'],
    });

    // Transform the bills into payee format
    const payees = bills.map(bill => ({
      id: bill.id,
      name: bill.name,
      expectedAmount: bill.amount,
      frequency: 'MONTHLY', // Default frequency
      startDate: bill.dueDate,
      categoryId: bill.category?.id,
      category: bill.category,
      description: bill.description,
    }));

    res.json(payees);
  } catch (error) {
    console.error('Error fetching payees:', error);
    res.status(500).json({ error: 'Failed to fetch payees' });
  }
});

// Create a new payee
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, expectedAmount, frequency, startDate, categoryId, description } = req.body;
    
    const bill = await prisma.bill.create({
      data: {
        name,
        amount: parseFloat(expectedAmount),
        dueDate: new Date(startDate),
        categoryId: parseInt(categoryId),
        description,
        userId: req.user.id,
        isOneTime: false,
        isPaid: false,
      },
      include: {
        category: true,
      },
    });

    // Transform the bill into payee format
    const payee = {
      id: bill.id,
      name: bill.name,
      expectedAmount: bill.amount,
      frequency: frequency || 'MONTHLY',
      startDate: bill.dueDate,
      categoryId: bill.categoryId,
      category: bill.category,
      description: bill.description,
    };

    res.json(payee);
  } catch (error) {
    console.error('Error creating payee:', error);
    res.status(500).json({ error: 'Failed to create payee' });
  }
});

// Update a payee
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, expectedAmount, frequency, startDate, categoryId, description } = req.body;
    
    const bill = await prisma.bill.update({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
      data: {
        name,
        amount: parseFloat(expectedAmount),
        dueDate: new Date(startDate),
        categoryId: parseInt(categoryId),
        description,
      },
      include: {
        category: true,
      },
    });

    // Transform the bill into payee format
    const payee = {
      id: bill.id,
      name: bill.name,
      expectedAmount: bill.amount,
      frequency: frequency || 'MONTHLY',
      startDate: bill.dueDate,
      categoryId: bill.categoryId,
      category: bill.category,
      description: bill.description,
    };

    res.json(payee);
  } catch (error) {
    console.error('Error updating payee:', error);
    res.status(500).json({ error: 'Failed to update payee' });
  }
});

// Delete a payee
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.bill.delete({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    });
    res.json({ message: 'Payee deleted successfully' });
  } catch (error) {
    console.error('Error deleting payee:', error);
    res.status(500).json({ error: 'Failed to delete payee' });
  }
});

export default router; 