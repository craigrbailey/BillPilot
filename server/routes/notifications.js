import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as notificationOperations from '../database/notificationOperations.js';

const router = express.Router();

// Get all notification settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const settings = await notificationOperations.getNotificationSettings(req.user.id);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update provider settings
router.put('/provider/:type', authenticateToken, async (req, res) => {
  try {
    const provider = await notificationOperations.updateNotificationProvider(
      req.user.id,
      req.params.type,
      req.body
    );
    res.json(provider);
  } catch (error) {
    console.error('Error updating notification provider:', error);
    res.status(500).json({ error: 'Failed to update notification provider' });
  }
});

// Update notification type settings
router.put('/type/:type', authenticateToken, async (req, res) => {
  try {
    const notificationType = await notificationOperations.updateNotificationType(
      req.user.id,
      req.params.type,
      req.body
    );
    res.json(notificationType);
  } catch (error) {
    console.error('Error updating notification type:', error);
    res.status(500).json({ error: 'Failed to update notification type' });
  }
});

// Test notification provider
router.post('/test/:type', authenticateToken, async (req, res) => {
  try {
    await notificationOperations.testNotificationProvider(req.user.id, req.params.type);
    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

export default router; 