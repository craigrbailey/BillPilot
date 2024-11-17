import express from 'express';
import prisma from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all categories for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create a new category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        color,
        userId: req.user.id,
      },
    });
    res.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update a category
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, color } = req.body;
    const category = await prisma.category.update({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
      data: {
        name,
        color,
      },
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete a category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.category.delete({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.id,
      },
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router; 