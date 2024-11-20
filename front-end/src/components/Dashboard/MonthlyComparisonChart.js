import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfMonth, endOfMonth, format, parseISO, subMonths } from 'date-fns';
import { formatAmount } from '../../utils/formatters';

const MonthlyComparisonChart = ({ bills, incomes }) => {
  const currentMonth = new Date();
  
  // Create data for the last 11 months plus current month (projected)
  const monthsData = Array.from({ length: 12 }, (_, index) => {
    const monthDate = subMonths(currentMonth, 11 - index);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const isProjected = index === 11; // Last month is projected

    // Group bills by category for this month
    const billsByCategory = bills.reduce((acc, bill) => {
      const dueDate = parseISO(bill.dueDate);
      if (dueDate >= monthStart && dueDate <= monthEnd && 
          (isProjected ? !bill.isPaid : bill.isPaid)) { // For projected month, show unpaid bills
        const categoryId = bill.category.id;
        if (!acc[categoryId]) {
          acc[categoryId] = {
            name: bill.category.name,
            color: bill.category.color,
            amount: 0
          };
        }
        acc[categoryId].amount += bill.amount;
      }
      return acc;
    }, {});

    // Calculate income for this month
    const monthlyIncome = incomes.reduce((sum, income) => {
      const date = parseISO(income.nextPayDate);
      if (date >= monthStart && date <= monthEnd) {
        return sum + income.amount;
      }
      return sum;
    }, 0);

    return {
      name: format(monthDate, 'MMM'),
      income: monthlyIncome,
      isProjected,
      ...Object.values(billsByCategory).reduce((acc, category) => {
        acc[category.name] = category.amount;
        return acc;
      }, {})
    };
  });

  // Create bars for each category
  const uniqueCategories = new Set();
  bills.forEach(bill => uniqueCategories.add(bill.category.name));
  
  const categoryBars = Array.from(uniqueCategories).map(categoryName => {
    const category = bills.find(bill => bill.category.name === categoryName).category;
    return (
      <Bar
        key={categoryName}
        dataKey={categoryName}
        stackId="bills"
        fill={category.color}
        name={categoryName}
        strokeDasharray={entry => entry.isProjected ? "3 3" : "0"} // Dashed border for projected
        fillOpacity={entry => entry.isProjected ? 0.7 : 1} // Lower opacity for projected
        stroke={category.color}
        strokeWidth={1}
      />
    );
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {payload[0]?.payload.name} {payload[0]?.payload.isProjected ? '(Projected)' : ''}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                color: entry.dataKey === 'income' ? 'success.main' : entry.color,
                fontWeight: 'medium',
              }}
            >
              {entry.name}: {formatAmount(entry.value)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper sx={{ p: 2, height: '400px' }}>
      <Typography variant="h6" gutterBottom>
        Monthly Income vs Bills (Last 12 Months)
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart 
          data={monthsData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis 
            dataKey="name"
            axisLine={{ strokeWidth: 2 }}
          />
          <YAxis 
            tickFormatter={(value) => formatAmount(value)}
            axisLine={{ strokeWidth: 2 }}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={false}
          />
          <Legend />
          <Bar
            dataKey="income"
            fill="#4caf50"
            name="Income"
            strokeDasharray={entry => entry.isProjected ? "3 3" : "0"}
            fillOpacity={entry => entry.isProjected ? 0.7 : 1}
            stroke="#4caf50"
            strokeWidth={1}
            activeBar={false}
          />
          {categoryBars.map(bar => React.cloneElement(bar, { activeBar: false }))}
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default MonthlyComparisonChart; 