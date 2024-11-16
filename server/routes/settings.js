import express from 'express';
import prisma from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { cacheService, CACHE_KEYS } from '../services/cacheService.js';

const router = express.Router();

// Get user settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Try to get from cache first
    const cacheKey = CACHE_KEYS.SETTINGS(userId);
    const cachedSettings = cacheService.get(cacheKey);
    
    if (cachedSettings) {
      return res.json(cachedSettings);
    }

    const settings = await prisma.settings.findUnique({
      where: { userId },
    });

    // Store in cache
    if (settings) {
      cacheService.set(cacheKey, settings);
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user settings
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await prisma.settings.upsert({
      where: { userId },
      update: {
        darkMode: req.body.darkMode,
        pushoverToken: req.body.pushoverToken,
        pushoverUser: req.body.pushoverUser,
        pushbulletToken: req.body.pushbulletToken,
        discordWebhook: req.body.discordWebhook,
        notifyOnDue: req.body.notifyOnDue,
        notifyDaysBefore: req.body.notifyDaysBefore,
        notifyOnPayment: req.body.notifyOnPayment,
      },
      create: {
        userId,
        darkMode: req.body.darkMode || false,
        pushoverToken: req.body.pushoverToken || null,
        pushoverUser: req.body.pushoverUser || null,
        pushbulletToken: req.body.pushbulletToken || null,
        discordWebhook: req.body.discordWebhook || null,
        notifyOnDue: req.body.notifyOnDue || true,
        notifyDaysBefore: req.body.notifyDaysBefore || 1,
        notifyOnPayment: req.body.notifyOnPayment || true,
      },
    });

    // Clear user settings cache
    const cacheKey = CACHE_KEYS.SETTINGS(userId);
    cacheService.delete(cacheKey);

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Add routes for email recipients
router.post('/email-recipients', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, name } = req.body;

    const settings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const recipient = await prisma.emailRecipient.create({
      data: {
        email,
        name,
        settingsId: settings.id,
      },
    });

    res.json(recipient);
  } catch (error) {
    console.error('Error adding email recipient:', error);
    res.status(500).json({ error: 'Failed to add email recipient' });
  }
});

router.delete('/email-recipients/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipientId = parseInt(req.params.id);

    const recipient = await prisma.emailRecipient.findFirst({
      where: {
        id: recipientId,
        settings: {
          userId,
        },
      },
    });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    await prisma.emailRecipient.delete({
      where: { id: recipientId },
    });

    res.json({ message: 'Recipient deleted successfully' });
  } catch (error) {
    console.error('Error deleting email recipient:', error);
    res.status(500).json({ error: 'Failed to delete email recipient' });
  }
});

export default router; 