import prisma from '../database/db.js';
import { addWeeks, addMonths } from 'date-fns';

const generateNextDate = (item, lastDate) => {
  switch (item.frequency) {
    case 'WEEKLY':
      return addWeeks(lastDate, 1);
    case 'BIWEEKLY':
      return addWeeks(lastDate, 2);
    case 'MONTHLY':
      return addMonths(lastDate, 1);
    default:
      return null;
  }
};

export const ensureRecurringItems = async (userId) => {
  try {
    // Handle Bills
    const recurringBills = await prisma.bill.findMany({
      where: {
        userId,
        isRecurring: true,
        frequency: {
          not: 'ONE_TIME'
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Handle Incomes
    const recurringIncomes = await prisma.income.findMany({
      where: {
        userId,
        isRecurring: true,
        frequency: {
          not: 'ONE_TIME'
        },
      },
      orderBy: {
        nextPayDate: 'asc',
      },
    });

    const twelveMonthsFromNow = addMonths(new Date(), 12);

    // Process Bills
    for (const bill of recurringBills) {
      const futureBills = await prisma.bill.findMany({
        where: {
          parentId: bill.id,
          dueDate: {
            gt: new Date(),
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
      });

      let lastDate = futureBills.length > 0 
        ? new Date(futureBills[futureBills.length - 1].dueDate)
        : new Date(bill.dueDate);

      while (lastDate < twelveMonthsFromNow) {
        const nextDate = generateNextDate(bill, lastDate);
        if (!nextDate) break;

        await prisma.bill.create({
          data: {
            name: bill.name,
            amount: bill.amount,
            dueDate: nextDate,
            categoryId: bill.categoryId,
            userId: bill.userId,
            isRecurring: true,
            frequency: bill.frequency,
            parentId: bill.id,
            notes: bill.notes,
          },
        });

        lastDate = nextDate;
      }
    }

    // Process Incomes
    for (const income of recurringIncomes) {
      const futureIncomes = await prisma.income.findMany({
        where: {
          parentId: income.id,
          nextPayDate: {
            gt: new Date(),
          },
        },
        orderBy: {
          nextPayDate: 'asc',
        },
      });

      let lastDate = futureIncomes.length > 0 
        ? new Date(futureIncomes[futureIncomes.length - 1].nextPayDate)
        : new Date(income.nextPayDate);

      while (lastDate < twelveMonthsFromNow) {
        const nextDate = generateNextDate(income, lastDate);
        if (!nextDate) break;

        await prisma.income.create({
          data: {
            name: income.name,
            amount: income.amount,
            frequency: income.frequency,
            nextPayDate: nextDate,
            startDate: income.startDate,
            userId: income.userId,
            isRecurring: true,
            parentId: income.id,
            notes: income.notes,
          },
        });

        lastDate = nextDate;
      }
    }
  } catch (error) {
    console.error('Error ensuring recurring items:', error);
    throw error;
  }
}; 