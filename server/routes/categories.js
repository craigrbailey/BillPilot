import express from 'express';
import prisma from '../database/db.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    // Check if category already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: req.body.name,
          mode: 'insensitive', // Case insensitive comparison
        },
      },
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name: req.body.name.trim(),
      },
    });
    res.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    // Check if category has any bills
    const categoryWithBills = await prisma.category.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { bills: true },
    });

    if (categoryWithBills?.bills.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that has bills. Please reassign or delete the bills first.' 
      });
    }

    const category = await prisma.category.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json(category);
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    // Check if new name already exists (if name is being changed)
    if (req.body.name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: {
            equals: req.body.name,
            mode: 'insensitive',
          },
          NOT: {
            id: parseInt(req.params.id),
          },
        },
      });

      if (existingCategory) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
    }

    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(req.body.name && { name: req.body.name.trim() }),
        ...(req.body.color && { color: req.body.color }),
      },
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

export default router; 