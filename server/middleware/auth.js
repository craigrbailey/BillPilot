import jwt from 'jsonwebtoken';
import prisma from '../database/db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    // Check if session exists in database
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || new Date() > session.expiresAt) {
      if (session) {
        // Clean up expired session
        await prisma.session.delete({ where: { id: session.id } });
      }
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.user = session.user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};
