import prisma from './db.js';

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
      isPaid: Boolean(billData.isPaid),
      userId: Number(userId),
      categoryId: category.id
    };

    // Validate numeric values
    if (isNaN(billToCreate.amount)) {
      throw new Error('Invalid numeric values');
    }

    // Validate date
    if (!(billToCreate.dueDate instanceof Date) || isNaN(billToCreate.dueDate)) {
      throw new Error('Invalid date');
    }

    // Create the bill with proper relations
    const createdBill = await prisma.bill.create({
      data: billToCreate,
      include: {
        category: true,
        history: true,
      },
    });

    return createdBill;
  } catch (error) {
    console.error('Error in createBill:', error);
    throw error;
  }
};

export const getAllBills = async (userId) => {
  return await prisma.bill.findMany({
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

  // Convert amount and balance to Float if they're strings
  const amount = parseFloat(billData.amount);
  const balance = billData.balance ? parseFloat(billData.balance) : null;

  return await prisma.bill.update({
    where: { id: parseInt(id) },
    data: {
      name: billData.name,
      amount: amount,
      dueDate: new Date(billData.dueDate),
      categoryId: parseInt(billData.categoryId),
      balance: balance,
      isPaid: billData.isPaid || false,
    },
    include: {
      category: true,
      history: true,
    },
  });
};

export const deleteBill = async (id, userId) => {
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

  return await prisma.bill.delete({
    where: { id: parseInt(id) },
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