import express from 'express';
import prisma from '../database/db.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateUser);

// Update settings
router.put('/', async (req, res) => {
  try {
    const { darkMode } = req.body;
    const settings = await prisma.settings.update({
      where: { userId: req.user.id },
      data: { darkMode },
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 