import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../database/db.js';
import { addDays } from 'date-fns';
import logger from '../utils/logger.js';

const router = express.Router();

// Check if using default credentials
router.get('/check-default', async (req, res) => {
  try {
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const user = await prisma.user.findUnique({
      where: { email: defaultEmail },
    });
    
    res.json({
      isUsingDefault: !!user,
      defaultEmail: process.env.DEFAULT_ADMIN_EMAIL,
    });
  } catch (error) {
    logger.error('Check default error:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.error('Register error:', { error: 'Email already registered', stack: error.stack });
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with settings
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        settings: {
          create: {
            darkMode: false,
          },
        },
      },
      include: {
        settings: true,
      },
    });

    // Create session
    const token = uuidv4();
    const session = await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt: addDays(new Date(), 30),
      },
    });

    res.json({
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        settings: user.settings,
      },
    });
  } catch (error) {
    logger.error('Register error:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        settings: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const token = uuidv4();
    const session = await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt: addDays(new Date(), 30),
      },
    });

    // Check if using default credentials and notify client
    const isDefaultUser = email === process.env.DEFAULT_ADMIN_EMAIL;

    res.json({
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        settings: user.settings,
      },
      isDefaultUser,
    });
  } catch (error) {
    logger.error('Login error:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await prisma.session.delete({
        where: { token },
      });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: error.message });
  }
});

export default router; 