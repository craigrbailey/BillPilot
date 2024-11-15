import prisma from './db.js';
import { cacheService, CACHE_KEYS } from '../services/cacheService.js';
import { addMonths } from 'date-fns';

// Bill operations
export const createBill = async (billData, userId) => {
  try {
    // Validate required fields
    if (!billData.name || !billData.amount || !billData.categoryId) {
      throw new Error('Missing required fields');
    }

    // First, verify the category exists
    const category = await prisma.category.findUnique({
      where: { id: Number(billData.categoryId) },
    });

    if (!category) {
      throw new Error('Invalid category');
    }

    // Convert and validate data types
    const billToCreate = {
      name: String(billData.name),
      amount: Number(billData.amount),
      dueDate: new Date(billData.dueDate),
      balance: billData.balance ? Number(billData.balance) : null,
      notes: billData.notes || null,
      isPaid: Boolean(billData.isPaid),
      userId: Number(userId),
      categoryId: category.id,
      isRecurring: Boolean(billData.isRecurring),
      frequency: billData.frequency || 'ONE_TIME',
      parentId: billData.parentId || null,
    };

    // Validate numeric values
    if (isNaN(billToCreate.amount)) {
      throw new Error('Invalid numeric values');
    }

    // Validate date
    if (!(billToCreate.dueDate instanceof Date) || isNaN(billToCreate.dueDate)) {
      throw new Error('Invalid date');
    }

    // Start a transaction to handle recurring bills
    const result = await prisma.$transaction(async (prisma) => {
      // Create the initial bill
      const initialBill = await prisma.bill.create({
        data: {
          ...billToCreate,
          parentId: null, // This will be the parent bill
        },
        include: {
          category: true,
          history: true,
        },
      });

      // If it's a recurring bill, create future instances
      if (billToCreate.isRecurring && billToCreate.frequency !== 'ONE_TIME') {
        const futureBills = [];
        let currentDate = new Date(billToCreate.dueDate);
        const endDate = addMonths(new Date(), 12);

        while (currentDate < endDate) {
          // Calculate next date based on frequency
          switch (billToCreate.frequency) {
            case 'WEEKLY':
              currentDate = addWeeks(currentDate, 1);
              break;
            case 'BIWEEKLY':
              currentDate = addWeeks(currentDate, 2);
              break;
            case 'MONTHLY':
              currentDate = addMonths(currentDate, 1);
              break;
            default:
              break;
          }

          if (currentDate >= endDate) break;

          // Create future instance
          futureBills.push({
            ...billToCreate,
            dueDate: currentDate,
            parentId: initialBill.id, // Link to parent bill
          });
        }

        // Create all future bills
        if (futureBills.length > 0) {
          await prisma.bill.createMany({
            data: futureBills,
          });
        }
      }

      return initialBill;
    });

    // Clear relevant cache
    cacheService.delete(CACHE_KEYS.BILLS(userId));
    
    return result;
  } catch (error) {
    console.error('Error in createBill:', error);
    throw error;
  }
};

export const getAllBills = async (userId) => {
  // Try to get from cache first
  const cacheKey = CACHE_KEYS.BILLS(userId);
  const cachedBills = cacheService.get(cacheKey);
  
  if (cachedBills) {
    return cachedBills;
  }

  // If not in cache, get from database
  const bills = await prisma.bill.findMany({
    where: {
      userId: userId,
    },
    include: {
      category: true,
      history: true,
    },
    orderBy: {
      dueDate: 'asc',
    },
  });

  // Store in cache
  cacheService.set(cacheKey, bills);
  
  return bills;
};

export const getBillById = async (id, userId) => {
  return await prisma.bill.findFirst({
    where: { 
      id: parseInt(id),
      userId: userId,
    },
    include: {
      category: true,
      history: true,
    },
  });
};

export const updateBill = async (id, billData, userId) => {
  // First verify the bill belongs to the user
  const bill = await prisma.bill.findFirst({
    where: {
      id: parseInt(id),
      userId: userId,
    },
  });

  if (!bill) {
    throw new Error('Bill not found or access denied');
  }

  const updatedBill = await prisma.bill.update({
    where: { id: parseInt(id) },
    data: {
      name: billData.name,
      amount: parseFloat(billData.amount),
      dueDate: new Date(billData.dueDate),
      categoryId: parseInt(billData.categoryId),
      balance: billData.balance ? parseFloat(billData.balance) : null,
      notes: billData.notes || null,
      isPaid: billData.isPaid || false,
      isRecurring: Boolean(billData.isRecurring),
      frequency: billData.frequency || 'ONE_TIME',
      parentId: billData.parentId || null,
    },
    include: {
      category: true,
      history: true,
    },
  });

  // Clear relevant cache
  cacheService.delete(CACHE_KEYS.BILLS(userId));
  
  return updatedBill;
};

export const deleteBill = async (id, userId, deleteAll = false) => {
  try {
    // First verify the bill belongs to the user
    const bill = await prisma.bill.findFirst({
      where: {
        id: parseInt(id),
        userId: userId,
      },
    });

    if (!bill) {
      throw new Error('Bill not found or access denied');
    }

    // Start a transaction
    await prisma.$transaction(async (prisma) => {
      if (deleteAll) {
        // If it's a parent bill, delete all children
        if (!bill.parentId) {
          await prisma.bill.deleteMany({
            where: {
              OR: [
                { id: parseInt(id) },
                { parentId: parseInt(id) },
              ],
            },
          });
        }
        // If it's a child bill, delete all siblings and parent
        else {
          await prisma.bill.deleteMany({
            where: {
              OR: [
                { id: bill.parentId },
                { parentId: bill.parentId },
              ],
            },
          });
        }
      } else {
        // Delete just this bill
        await prisma.bill.delete({
          where: { id: parseInt(id) },
        });
      }
    });

    // Clear relevant cache
    cacheService.delete(CACHE_KEYS.BILLS(userId));
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteBill:', error);
    throw error;
  }
};

export const markBillPaid = async (id, userId) => {
  // First verify the bill belongs to the user
  const bill = await prisma.bill.findFirst({
    where: {
      id: parseInt(id),
      userId: userId,
    },
  });

  if (!bill) {
    throw new Error('Bill not found or access denied');
  }

  return await prisma.bill.update({
    where: { id: parseInt(id) },
    data: {
      isPaid: true,
    },
    include: {
      category: true,
      history: true,
    },
  });
};

// Payment operations
export const addPayment = async (billId, amount) => {
  const bill = await prisma.bill.findUnique({
    where: { id: parseInt(billId) },
  });

  return await prisma.$transaction(async (prisma) => {
    // Create the payment
    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        billId: parseInt(billId),
      },
    });

    // Update bill balance if it exists
    if (bill.balance !== null) {
      await prisma.bill.update({
        where: { id: parseInt(billId) },
        data: {
          balance: bill.balance - parseFloat(amount),
        },
      });
    }

    return payment;
  });
};

export const getBillPayments = async (billId) => {
  return await prisma.payment.findMany({
    where: { billId: parseInt(billId) },
    orderBy: { paidDate: 'desc' },
  });
};

export const markBillAsPaid = async (billId, userId, paidDate) => {
  try {
    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      const bill = await prisma.bill.findFirst({
        where: {
          id: parseInt(billId),
          userId: userId,
        },
      });

      if (!bill) {
        throw new Error('Bill not found or access denied');
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          amount: bill.amount,
          paidDate: paidDate ? new Date(paidDate) : new Date(),
          billId: parseInt(billId),
        },
      });

      // Update bill status
      const updatedBill = await prisma.bill.update({
        where: { id: parseInt(billId) },
        data: {
          isPaid: true,
          paidDate: payment.paidDate,
        },
        include: {
          category: true,
        },
      });

      return { bill: updatedBill, payment };
    });

    // Clear relevant cache
    cacheService.delete(CACHE_KEYS.BILLS(userId));
    cacheService.delete(CACHE_KEYS.PAYMENTS(userId));
    
    return result;
  } catch (error) {
    throw new Error(`Error marking bill as paid: ${error.message}`);
  }
};

export const getPaymentHistory = async (userId) => {
  // Try to get from cache first
  const cacheKey = CACHE_KEYS.PAYMENTS(userId);
  const cachedPayments = cacheService.get(cacheKey);
  
  if (cachedPayments) {
    return cachedPayments;
  }

  const payments = await prisma.payment.findMany({
    where: {
      bill: {
        userId: userId,
      },
    },
    include: {
      bill: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      paidDate: 'desc',
    },
  });

  // Store in cache
  cacheService.set(cacheKey, payments);
  
  return payments;
};

// Add a function to clear all user cache
export const clearUserCache = (userId) => {
  cacheService.clearUserCache(userId);
};
