import prisma from '../database/db.js';
import bcrypt from 'bcryptjs';

export const initializeAdmin = async () => {
  try {
    // Check if any user exists
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL;
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;
      
      if (!defaultEmail || !defaultPassword) {
        console.error('Default admin credentials not found in environment variables');
        return;
      }

      // Create default admin user
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await prisma.user.create({
        data: {
          email: defaultEmail,
          password: hashedPassword,
          settings: {
            create: {
              darkMode: false,
            },
          },
        },
      });

      console.log('Default admin user created successfully');
    }
  } catch (error) {
    console.error('Failed to initialize admin user:', error);
  }
}; 