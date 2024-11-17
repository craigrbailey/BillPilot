import { PrismaClient } from '@prisma/client';

let prisma;

try {
  prisma = new PrismaClient();
  
  // Test the database connection
  prisma.$connect()
    .then(() => {
      console.log('Successfully connected to the database');
    })
    .catch((error) => {
      console.error('Failed to connect to the database:', error);
      process.exit(1);
    });
} catch (error) {
  console.error('Error initializing Prisma client:', error);
  process.exit(1);
}

export default prisma;
