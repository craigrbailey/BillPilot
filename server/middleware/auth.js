import prisma from '../database/db.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { include: { settings: true } } },
    });

    if (!session || new Date() > session.expiresAt) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return res.status(401).json({ error: 'Session expired' });
    }

    req.user = session.user;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 