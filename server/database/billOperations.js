import prisma from './db.js';
import { addMonths, addWeeks, startOfDay, endOfDay } from 'date-fns';

// Payee Operations
export const getPayees = async (userId) => {
  return await prisma.payees.findMany({
    where: { userId },
    include: {
      category: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
};

export const createPayee = async (userId, payeeData) => {
  const { name, expectedAmount, frequency, startDate, categoryId, description } = payeeData;

  const payee = await prisma.payees.create({
    data: {
      userId,
      name,
      expectedAmount: parseFloat(expectedAmount),
      frequency,
      startDate: new Date(startDate),
      categoryId: parseInt(categoryId),
      description,
    },
    include: {
      category: true,
    },
  });

  // Generate initial bills for the next 12 months
  await generateRecurringBills(userId, payee.id);

  return payee;
};

export const updatePayee = async (userId, payeeId, payeeData) => {
  const { name, expectedAmount, frequency, startDate, categoryId, description } = payeeData;

  return await prisma.payees.update({
    where: {
      id: parseInt(payeeId),
      userId,
    },
    data: {
      name,
      expectedAmount: parseFloat(expectedAmount),
      frequency,
      startDate: new Date(startDate),
      categoryId: parseInt(categoryId),
      description,
    },
    include: {
      category: true,
    },
  });
};

export const deletePayee = async (userId, payeeId) => {
  // Delete all associated bills first
  await prisma.bills.deleteMany({
    where: {
      payeeId: parseInt(payeeId),
      userId,
    },
  });

  return await prisma.payees.delete({
    where: {
      id: parseInt(payeeId),
      userId,
    },
  });
};

// Bill Operations
export const getBills = async (userId) => {
  return await prisma.bills.findMany({
    where: { userId },
    include: {
      category: true,
      payee: true,
      payments: true,
    },
    orderBy: {
      dueDate: 'asc',
    },
  });
};

export const createBill = async (userId, billData) => {
  const {
    amount,
    dueDate,
    payeeId,
    categoryId,
    description,
    isOneTime,
    payeeName,
    isPaid,
    paidDate,
  } = billData;

  return await prisma.bills.create({
    data: {
      userId,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      payeeId: payeeId ? parseInt(payeeId) : null,
      categoryId: parseInt(categoryId),
      description,
      isOneTime: Boolean(isOneTime),
      payeeName,
      isPaid: Boolean(isPaid),
      paidDate: paidDate ? new Date(paidDate) : null,
    },
    include: {
      category: true,
      payee: true,
      payments: true,
    },
  });
};

export const updateBill = async (userId, billId, billData) => {
  const {
    amount,
    dueDate,
    payeeId,
    categoryId,
    description,
    isOneTime,
    payeeName,
    isPaid,
    paidDate,
  } = billData;

  return await prisma.bills.update({
    where: {
      id: parseInt(billId),
      userId,
    },
    data: {
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      payeeId: payeeId ? parseInt(payeeId) : null,
      categoryId: parseInt(categoryId),
      description,
      isOneTime: Boolean(isOneTime),
      payeeName,
      isPaid: Boolean(isPaid),
      paidDate: paidDate ? new Date(paidDate) : null,
    },
    include: {
      category: true,
      payee: true,
      payments: true,
    },
  });
};

export const deleteBill = async (userId, billId) => {
  // Delete associated payments first
  await prisma.bill_payments.deleteMany({
    where: {
      billId: parseInt(billId),
    },
  });

  return await prisma.bills.delete({
    where: {
      id: parseInt(billId),
      userId,
    },
  });
};

// Payment Operations
export const addPayment = async (userId, billId, paymentData) => {
  const { paymentDate } = paymentData;

  const bill = await prisma.bills.findFirst({
    where: {
      id: parseInt(billId),
      userId,
    },
  });

  return await prisma.$transaction(async (prisma) => {
    // Create payment record
    const payment = await prisma.bill_payments.create({
      data: {
        billId: parseInt(billId),
        amount: bill.amount,
        paymentDate: new Date(paymentDate),
      },
    });

    // Update bill status
    await prisma.bills.update({
      where: {
        id: parseInt(billId),
      },
      data: {
        isPaid: true,
        paidDate: new Date(paymentDate),
      },
    });

    return payment;
  });
};

// Generate recurring bills
export const generateRecurringBills = async (userId, payeeId) => {
  const payee = await prisma.payees.findFirst({
    where: {
      id: parseInt(payeeId),
      userId,
    },
  });

  if (!payee) return;

  const bills = [];
  let currentDate = new Date(payee.startDate);
  const endDate = addMonths(new Date(), 12); // Generate bills for the next 12 months

  while (currentDate < endDate) {
    // Calculate next date based on frequency
    switch (payee.frequency) {
      case 'WEEKLY':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'BIWEEKLY':
        currentDate = addWeeks(currentDate, 2);
        break;
      case 'MONTHLY':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'QUARTERLY':
        currentDate = addMonths(currentDate, 3);
        break;
      case 'BIANNUAL':
        currentDate = addMonths(currentDate, 6);
        break;
      case 'ANNUAL':
        currentDate = addMonths(currentDate, 12);
        break;
      default:
        break;
    }

    if (currentDate >= endDate) break;

    bills.push({
      userId,
      payeeId: payee.id,
      amount: payee.expectedAmount,
      dueDate: currentDate,
      categoryId: payee.categoryId,
      description: payee.description,
      isOneTime: false,
      isPaid: false,
    });
  }

  if (bills.length > 0) {
    await prisma.bills.createMany({
      data: bills,
    });
  }

  return bills;
};

export default {
  getPayees,
  createPayee,
  updatePayee,
  deletePayee,
  getBills,
  createBill,
  updateBill,
  deleteBill,
  addPayment,
  generateRecurringBills,
}; 