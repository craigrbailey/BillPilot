import { CronJob } from 'cron';
import prisma from '../database/db.js';
import { startOfDay, endOfDay, addDays, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, parseISO, subDays } from 'date-fns';
import notificationService from './notifications/index.js';

// Helper function to get enabled providers for a notification type
const getEnabledProviders = async (userId, typeId) => {
  const mappings = await prisma.provider_type_mapping.findMany({
    where: {
      userId,
      typeId,
    },
    include: {
      provider: true,
    },
  });

  return mappings
    .filter(mapping => mapping.provider.is_enabled)
    .map(mapping => ({
      type: mapping.provider.provider_type,
      credentials: mapping.provider.credentials,
    }));
};

// Check for upcoming bills and send notifications
const checkUpcomingBills = async () => {
  const notificationTypes = await prisma.notificationTypes.findMany({
    where: {
      type: 'BILL_DUE',
      is_enabled: true,
    },
  });

  for (const type of notificationTypes) {
    const { userId, settings } = type;
    const daysBeforeDue = settings.days_before || 3;
    const checkDate = addDays(new Date(), daysBeforeDue);

    const bills = await prisma.bill.findMany({
      where: {
        userId,
        dueDate: {
          gte: startOfDay(checkDate),
          lte: endOfDay(checkDate),
        },
        isPaid: false,
      },
      include: {
        category: true,
      },
    });

    if (bills.length > 0) {
      const providers = await getEnabledProviders(userId, type.id);
      const message = {
        subject: 'Upcoming Bills Reminder',
        body: `You have ${bills.length} bill(s) due on ${format(checkDate, 'MMM dd, yyyy')}:\n\n` +
          bills.map(bill => `- ${bill.name} (${bill.category.name}): $${bill.amount.toFixed(2)}`).join('\n'),
      };

      try {
        await notificationService.sendNotification(userId, message, providers);
      } catch (error) {
        console.error(`Failed to send bill reminder for user ${userId}:`, error);
      }
    }
  }
};

// Check for overdue bills
const checkOverdueBills = async () => {
  const notificationTypes = await prisma.notificationTypes.findMany({
    where: {
      type: 'BILL_OVERDUE',
      is_enabled: true,
    },
  });

  for (const type of notificationTypes) {
    const { userId } = type;
    
    const bills = await prisma.bill.findMany({
      where: {
        userId,
        dueDate: {
          lt: startOfDay(new Date()),
        },
        isPaid: false,
      },
      include: {
        category: true,
      },
    });

    if (bills.length > 0) {
      const providers = await getEnabledProviders(userId, type.id);
      const message = {
        subject: 'Overdue Bills Alert',
        body: `You have ${bills.length} overdue bill(s):\n\n` +
          bills.map(bill => 
            `- ${bill.name} (${bill.category.name}): $${bill.amount.toFixed(2)} - Due: ${format(new Date(bill.dueDate), 'MMM dd, yyyy')}`
          ).join('\n'),
      };

      try {
        await notificationService.sendNotification(userId, message, providers);
      } catch (error) {
        console.error(`Failed to send overdue alert for user ${userId}:`, error);
      }
    }
  }
};

// Generate weekly summary
const sendWeeklySummary = async () => {
  const notificationTypes = await prisma.notificationTypes.findMany({
    where: {
      type: 'WEEKLY_SUMMARY',
      is_enabled: true,
    },
  });

  for (const type of notificationTypes) {
    const { userId, settings } = type;
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const nextWeekStart = addDays(weekEnd, 1);
    const nextWeekEnd = addDays(nextWeekStart, 6);

    // Get this week's data
    const [currentBills, currentIncome] = await Promise.all([
      prisma.bill.findMany({
        where: {
          userId,
          dueDate: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        include: { category: true },
      }),
      prisma.income_entries.findMany({
        where: {
          userId,
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
      }),
    ]);

    // Get next week's data
    const upcomingBills = await prisma.bill.findMany({
      where: {
        userId,
        dueDate: {
          gte: nextWeekStart,
          lte: nextWeekEnd,
        },
        isPaid: false,
      },
      include: { category: true },
    });

    // Calculate totals
    const totalBills = currentBills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalIncome = currentIncome.reduce((sum, income) => sum + income.amount, 0);
    const paidBills = currentBills.filter(bill => bill.isPaid);
    const unpaidBills = currentBills.filter(bill => !bill.isPaid);

    // Generate message
    const message = {
      subject: `Weekly Financial Summary - ${format(weekStart, 'MMM d')} to ${format(weekEnd, 'MMM d, yyyy')}`,
      body: `
Weekly Summary:

Total Income: ${formatAmount(totalIncome)}
Total Bills: ${formatAmount(totalBills)}
Net: ${formatAmount(totalIncome - totalBills)}

Bills This Week:
- Paid (${paidBills.length}): ${formatAmount(paidBills.reduce((sum, bill) => sum + bill.amount, 0))}
- Unpaid (${unpaidBills.length}): ${formatAmount(unpaidBills.reduce((sum, bill) => sum + bill.amount, 0))}

${unpaidBills.length > 0 ? `\nUnpaid Bills:\n${unpaidBills.map(bill => 
  `- ${bill.name} (${bill.category.name}): ${formatAmount(bill.amount)} - Due: ${format(new Date(bill.dueDate), 'MMM d')}`
).join('\n')}` : ''}

Upcoming Bills Next Week (${upcomingBills.length}):
${upcomingBills.map(bill => 
  `- ${bill.name} (${bill.category.name}): ${formatAmount(bill.amount)} - Due: ${format(new Date(bill.dueDate), 'MMM d')}`
).join('\n')}
      `.trim(),
    };

    const providers = await getEnabledProviders(userId, type.id);
    try {
      await notificationService.sendNotification(userId, message, providers);
    } catch (error) {
      console.error(`Failed to send weekly summary for user ${userId}:`, error);
    }
  }
};

// Generate monthly summary
const sendMonthlySummary = async () => {
  const notificationTypes = await prisma.notificationTypes.findMany({
    where: {
      type: 'MONTHLY_SUMMARY',
      is_enabled: true,
    },
  });

  for (const type of notificationTypes) {
    const { userId, settings } = type;
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const lastMonthStart = startOfMonth(subDays(monthStart, 1));
    const lastMonthEnd = endOfMonth(subDays(monthStart, 1));

    // Get this month's data
    const [currentBills, currentIncome] = await Promise.all([
      prisma.bill.findMany({
        where: {
          userId,
          dueDate: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        include: { category: true },
      }),
      prisma.income_entries.findMany({
        where: {
          userId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
    ]);

    // Get last month's data for comparison
    const [lastMonthBills, lastMonthIncome] = await Promise.all([
      prisma.bill.findMany({
        where: {
          userId,
          dueDate: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      }),
      prisma.income_entries.findMany({
        where: {
          userId,
          date: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      }),
    ]);

    // Calculate totals
    const totalBills = currentBills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalIncome = currentIncome.reduce((sum, income) => sum + income.amount, 0);
    const lastMonthTotalBills = lastMonthBills.reduce((sum, bill) => sum + bill.amount, 0);
    const lastMonthTotalIncome = lastMonthIncome.reduce((sum, income) => sum + income.amount, 0);

    // Group bills by category
    const billsByCategory = currentBills.reduce((acc, bill) => {
      const categoryName = bill.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { total: 0, count: 0 };
      }
      acc[categoryName].total += bill.amount;
      acc[categoryName].count += 1;
      return acc;
    }, {});

    // Generate message
    const message = {
      subject: `Monthly Financial Summary - ${format(monthStart, 'MMMM yyyy')}`,
      body: `
Monthly Summary:

Total Income: ${formatAmount(totalIncome)}
Total Bills: ${formatAmount(totalBills)}
Net: ${formatAmount(totalIncome - totalBills)}

Comparison to Last Month:
Income: ${formatAmount(totalIncome)} (${totalIncome > lastMonthTotalIncome ? '↑' : '↓'} ${formatAmount(Math.abs(totalIncome - lastMonthTotalIncome))})
Bills: ${formatAmount(totalBills)} (${totalBills > lastMonthTotalBills ? '↑' : '↓'} ${formatAmount(Math.abs(totalBills - lastMonthTotalBills))})

Bills by Category:
${Object.entries(billsByCategory).map(([category, data]) => 
  `- ${category}: ${formatAmount(data.total)} (${data.count} bills)`
).join('\n')}

Unpaid Bills:
${currentBills.filter(bill => !bill.isPaid).map(bill => 
  `- ${bill.name} (${bill.category.name}): ${formatAmount(bill.amount)} - Due: ${format(new Date(bill.dueDate), 'MMM d')}`
).join('\n')}
      `.trim(),
    };

    const providers = await getEnabledProviders(userId, type.id);
    try {
      await notificationService.sendNotification(userId, message, providers);
    } catch (error) {
      console.error(`Failed to send monthly summary for user ${userId}:`, error);
    }
  }
};

// Initialize cron jobs
const initializeScheduler = () => {
  // Check upcoming bills daily at 9 AM
  new CronJob('0 9 * * *', checkUpcomingBills, null, true);

  // Check overdue bills daily at 10 AM
  new CronJob('0 10 * * *', checkOverdueBills, null, true);

  // Send weekly summary on Sundays at 8 AM
  new CronJob('0 8 * * 0', sendWeeklySummary, null, true);

  // Send monthly summary on the 1st of each month at 8 AM
  new CronJob('0 8 1 * *', sendMonthlySummary, null, true);

  console.log('Notification scheduler initialized');
};

export default {
  initializeScheduler,
  checkUpcomingBills,
  checkOverdueBills,
  sendWeeklySummary,
  sendMonthlySummary,
}; 