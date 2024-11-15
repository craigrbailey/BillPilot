import { addWeeks, addMonths, startOfDay, isBefore, isAfter } from 'date-fns';

export const generateRecurringDates = (item, monthsAhead = 12) => {
  const dates = [];
  let currentDate = startOfDay(new Date(item.nextPayDate));
  const endDate = addMonths(new Date(), monthsAhead);

  while (isBefore(currentDate, endDate)) {
    dates.push(new Date(currentDate));

    switch (item.frequency) {
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
        // ONE_TIME payments only get one date
        return dates;
    }
  }

  return dates;
};

export const shouldGenerateNewRecurring = (items) => {
  const futureItems = items.filter(item => 
    item.isRecurring && 
    isAfter(new Date(item.nextPayDate || item.dueDate), new Date())
  );

  // Group by parent item
  const groupedItems = futureItems.reduce((acc, item) => {
    const parentId = item.parentId || item.id;
    if (!acc[parentId]) {
      acc[parentId] = [];
    }
    acc[parentId].push(item);
    return acc;
  }, {});

  // Check each group
  return Object.values(groupedItems).some(group => group.length < 12);
}; 