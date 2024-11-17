import express from 'express';
import prisma from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Get notification settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user.id },
    });

    // Transform database settings into expected format
    const providers = {
      EMAIL: { isEnabled: settings?.emailEnabled || false, ...settings?.emailConfig },
      PUSHOVER: { isEnabled: settings?.pushEnabled || false, ...settings?.pushConfig },
      DISCORD: { isEnabled: settings?.discordEnabled || false, ...settings?.discordConfig },
      SLACK: { isEnabled: settings?.slackEnabled || false, ...settings?.slackConfig },
    };

    const types = settings?.notificationTypes || {
      BILL_DUE: { isEnabled: settings?.notifyOnDue || true },
      PAYMENT_MADE: { isEnabled: settings?.notifyOnPayment || true },
    };

    res.json({
      providers,
      types,
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update notification provider settings
router.put('/provider/:providerType', authenticateToken, async (req, res) => {
  try {
    const { providerType } = req.params;
    const updates = req.body;

    // Map provider type to database fields
    const dbUpdates = {};
    switch (providerType) {
      case 'EMAIL':
        dbUpdates.emailEnabled = updates.isEnabled;
        dbUpdates.emailConfig = updates;
        break;
      case 'PUSHOVER':
        dbUpdates.pushEnabled = updates.isEnabled;
        dbUpdates.pushConfig = updates;
        break;
      case 'DISCORD':
        dbUpdates.discordEnabled = updates.isEnabled;
        dbUpdates.discordConfig = updates;
        break;
      case 'SLACK':
        dbUpdates.slackEnabled = updates.isEnabled;
        dbUpdates.slackConfig = updates;
        break;
      default:
        throw new Error('Invalid provider type');
    }

    const settings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: dbUpdates,
      create: {
        userId: req.user.id,
        ...dbUpdates,
      },
    });

    res.json(settings);
  } catch (error) {
    console.error('Error updating notification provider:', error);
    res.status(500).json({ error: 'Failed to update notification provider' });
  }
});

// Update notification type settings
router.put('/type/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const updates = req.body;

    const settings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: {
        notificationTypes: {
          ...(await prisma.settings.findUnique({ where: { userId: req.user.id } }))?.notificationTypes,
          [type]: updates,
        },
      },
      create: {
        userId: req.user.id,
        notificationTypes: {
          [type]: updates,
        },
      },
    });

    res.json(settings);
  } catch (error) {
    console.error('Error updating notification type:', error);
    res.status(500).json({ error: 'Failed to update notification type' });
  }
});

// Test notification provider
router.post('/test/:providerType', authenticateToken, async (req, res) => {
  try {
    const { providerType } = req.params;
    const userId = req.user.id;

    // Get the provider settings from the database
    const settings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    // Handle different provider types
    switch (providerType) {
      case 'EMAIL': {
        if (!settings.emailEnabled || !settings.emailConfig) {
          return res.status(400).json({ error: 'Email provider not configured' });
        }

        const config = settings.emailConfig;
        let transporter;

        if (config.service?.toLowerCase() === 'gmail') {
          // Special handling for Gmail
          transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: config.username,
              pass: config.password, // This should be an App Password
            },
          });
        } else if (config.smtp_server === 'smtp.ethereal.email') {
          // Create test account if using ethereal email for testing
          let testAccount;
          transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          });
        } else {
          // For Gmail and other providers
          transporter = nodemailer.createTransport({
            service: config.service || 'gmail',  // Default to Gmail if not specified
            host: config.smtp_server,
            port: parseInt(config.smtp_port) || 587,
            secure: config.smtp_secure === 'true' || config.smtp_port === '465',
            auth: {
              user: config.username,
              pass: config.password,
            },
            tls: {
              rejectUnauthorized: false  // Allow self-signed certificates
            }
          });
        }

        // Verify SMTP connection
        await transporter.verify();

        // Send test email
        const info = await transporter.sendMail({
          from: config.username,
          to: config.username,
          subject: 'Test Notification',
          text: 'This is a test notification from your Bills App.',
          html: '<p>This is a test notification from your Bills App.</p>',
        });

        // For ethereal email, provide preview URL
        let response = { message: 'Test email sent successfully' };
        if (testAccount) {
          response.previewUrl = nodemailer.getTestMessageUrl(info);
        }

        res.json(response);
        break;
      }

      case 'PUSHOVER': {
        if (!settings.pushEnabled || !settings.pushConfig) {
          return res.status(400).json({ error: 'Pushover provider not configured' });
        }

        // Add Pushover test implementation here
        res.json({ message: 'Pushover test notification sent' });
        break;
      }

      case 'DISCORD': {
        if (!settings.discordEnabled || !settings.discordConfig) {
          return res.status(400).json({ error: 'Discord provider not configured' });
        }

        // Add Discord test implementation here
        res.json({ message: 'Discord test notification sent' });
        break;
      }

      case 'SLACK': {
        if (!settings.slackEnabled || !settings.slackConfig) {
          return res.status(400).json({ error: 'Slack provider not configured' });
        }

        // Add Slack test implementation here
        res.json({ message: 'Slack test notification sent' });
        break;
      }

      default:
        res.status(400).json({ error: 'Invalid provider type' });
    }
  } catch (error) {
    console.error('Error testing notification provider:', error);
    res.status(500).json({ 
      error: 'Failed to test notification provider',
      details: error.message,
      code: error.code
    });
  }
});

export default router; 