import { Paper, Typography, Grid, Box, Divider } from '@mui/material';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { formatAmount } from '../../utils/formatters';

const MonthlyFinancialSummary = ({ bills, incomes }) => {
  const currentMonth = {
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  };

  // Income Calculations
  const currentMonthIncomes = incomes.filter(income => {
    const incomeDate = new Date(income.nextPayDate);
    return isWithinInterval(incomeDate, currentMonth);
  });

  const receivedIncome = currentMonthIncomes
    .filter(income => income.lastPaid)
    .reduce((sum, income) => sum + Number(income.amount), 0);

  const projectedIncome = currentMonthIncomes
    .filter(income => !income.lastPaid)
    .reduce((sum, income) => sum + Number(income.amount), 0);

  const totalIncome = receivedIncome + projectedIncome;

  // Bills Calculations
  const currentMonthBills = bills.filter(bill => {
    const billDate = new Date(bill.dueDate);
    return isWithinInterval(billDate, currentMonth);
  });

  const paidBills = currentMonthBills
    .filter(bill => bill.isPaid)
    .reduce((sum, bill) => sum + Number(bill.amount), 0);

  const unpaidBills = currentMonthBills
    .filter(bill => !bill.isPaid)
    .reduce((sum, bill) => sum + Number(bill.amount), 0);

  const totalBills = paidBills + unpaidBills;

  // Balance Calculations
  const currentBalance = receivedIncome - paidBills;
  const projectedBalance = totalIncome - totalBills;

  const getBalanceColor = (amount) => {
    if (amount > 0) return 'success.main';
    if (amount < 0) return 'error.main';
    return 'text.primary';
  };

  const SummaryColumn = ({ title, items }) => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {items.map((item, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {item.label}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: item.color || (
                title === 'Balance' ? getBalanceColor(item.amount) :
                item.isPositive ? 'success.main' : 'text.primary'
              ),
              fontWeight: 'bold'
            }}
          >
            {formatAmount(item.amount)}
          </Typography>
          {index < items.length - 1 && (
            <Divider sx={{ my: 1 }} />
          )}
        </Box>
      ))}
    </Paper>
  );

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Current Month Summary
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <SummaryColumn
            title="Income"
            items={[
              { label: 'Received Income', amount: receivedIncome, isPositive: true },
              { label: 'Projected Income', amount: projectedIncome, isPositive: true },
              { label: 'Total Expected', amount: totalIncome, isPositive: true },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryColumn
            title="Bills"
            items={[
              { label: 'Paid Bills', amount: paidBills },
              { label: 'Unpaid Bills', amount: unpaidBills, color: 'warning.main' },
              { label: 'Total Bills', amount: totalBills, color: 'error.main' },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryColumn
            title="Balance"
            items={[
              { 
                label: 'Current Balance', 
                amount: currentBalance,
              },
              { 
                label: 'Projected Balance', 
                amount: projectedBalance,
              },
            ]}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MonthlyFinancialSummary; 