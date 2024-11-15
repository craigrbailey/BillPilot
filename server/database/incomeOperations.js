import prisma from './db.js';
import { addDays, addWeeks, addMonths, setDate } from 'date-fns';

const calculateNextPayDate = (income) => {
  const lastPaid = income.lastPaid || income.startDate;

  switch (income.frequency) {
    case 'WEEKLY':
      return addWeeks(lastPaid, 1);
    case 'BIWEEKLY':
      return addWeeks(lastPaid, 2);
    case 'MONTHLY':
      return addMonths(lastPaid, 1);
    default:
      throw new Error('Invalid frequency');
  }
};

export const createIncome = async (incomeData, userId) => {
  try {
    // Validate required fields
    if (!incomeData.name || !incomeData.amount || !incomeData.frequency) {
      throw new Error('Missing required fields');
    }

    // Convert and validate data types
    const data = {
      name: String(incomeData.name),
      amount: Number(incomeData.amount),
      frequency: incomeData.frequency,
      dayOfWeek: incomeData.dayOfWeek ? Number(incomeData.dayOfWeek) : null,
      dayOfMonth: incomeData.dayOfMonth ? Number(incomeData.dayOfMonth) : null,
      startDate: new Date(incomeData.startDate),
      isRecurring: Boolean(incomeData.isRecurring),
      userId: Number(userId),
    };

    // Set initial nextPayDate
    data.nextPayDate = data.startDate;

    // Validate numeric values
    if (isNaN(data.amount)) {
      throw new Error('Invalid amount');
    }

    // Validate date
    if (!(data.startDate instanceof Date) || isNaN(data.startDate)) {
      throw new Error('Invalid date');
    }

    // Validate frequency-specific fields
    if (data.frequency === 'WEEKLY' && (data.dayOfWeek < 0 || data.dayOfWeek > 6)) {
      throw new Error('Invalid day of week');
    }
    if (data.frequency === 'MONTHLY' && (data.dayOfMonth < 1 || data.dayOfMonth > 31)) {
      throw new Error('Invalid day of month');
    }

    return await prisma.income.create({
      data,
    });
  } catch (error) {
    console.error('Error in createIncome:', error);
    throw error;
  }
};

export const getAllIncomes = async (userId) => {
  return await prisma.income.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      nextPayDate: 'asc',
    },
  });
};

export const getIncomeById = async (id, userId) => {
  return await prisma.income.findFirst({
    where: {
      id: parseInt(id),
      userId: userId,
    },
  });
};

export const updateIncome = async (id, incomeData, userId) => {
  // First verify the income belongs to the user
  const income = await prisma.income.findFirst({
    where: {
      id: parseInt(id),
      userId: userId,
    },
  });

  if (!income) {
    throw new Error('Income not found or access denied');
  }

  const data = {
    name: String(incomeData.name),
    amount: Number(incomeData.amount),
    frequency: incomeData.frequency,
    dayOfWeek: incomeData.dayOfWeek ? Number(incomeData.dayOfWeek) : null,
    dayOfMonth: incomeData.dayOfMonth ? Number(incomeData.dayOfMonth) : null,
    startDate: new Date(incomeData.startDate),
    isRecurring: Boolean(incomeData.isRecurring),
  };

  // Update nextPayDate if needed
  if (incomeData.lastPaid) {
    data.lastPaid = new Date(incomeData.lastPaid);
    data.nextPayDate = calculateNextPayDate({
      ...data,
      lastPaid: data.lastPaid,
    });
  }

  return await prisma.income.update({
    where: { id: parseInt(id) },
    data,
  });
};

export const deleteIncome = async (id, userId) => {
  // First verify the income belongs to the user
  const income = await prisma.income.findFirst({
    where: {
      id: parseInt(id),
      userId: userId,
    },
  });

  if (!income) {
    throw new Error('Income not found or access denied');
  }

  return await prisma.income.delete({
    where: { id: parseInt(id) },
  });
};

export const markIncomePaid = async (id, userId) => {
  const income = await prisma.income.findFirst({
    where: {
      id: parseInt(id),
      userId: userId,
    },
  });

  if (!income) {
    throw new Error('Income not found or access denied');
  }

  const now = new Date();
  const nextPayDate = calculateNextPayDate({
    ...income,
    lastPaid: now,
  });

  return await prisma.income.update({
    where: { id: parseInt(id) },
    data: {
      lastPaid: now,
      nextPayDate: income.isRecurring ? nextPayDate : null,
    },
  });
}; 