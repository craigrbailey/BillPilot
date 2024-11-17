import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import { format, addDays, isWithinInterval, parseISO, startOfDay, isThisMonth } from 'date-fns';
import { formatAmount } from '../../utils/formatters';
import StyledTooltip from '../Dashboard/StyledComponents/StyledTooltip';

const FinancialOverview = ({ bills, incomes, onMarkPaid, onUnpay }) => {
  const today = startOfDay(new Date());
  const thirtyDaysFromNow = addDays(today, 30);

  // Filter items for next 30 days
  const upcomingIncomes = incomes.filter(income => {
    const date = parseISO(income.nextPayDate);
    return isWithinInterval(date, { start: today, end: thirtyDaysFromNow });
  });

  const upcomingBills = bills.filter(bill => {
    const date = parseISO(bill.dueDate);
    return isWithinInterval(date, { start: today, end: thirtyDaysFromNow });
  });

  // Calculate totals
  const totalIncome = upcomingIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalBills = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);
  const unpaidBills = upcomingBills.filter(bill => !bill.isPaid);
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);

  // Sort items by date
  const sortedIncomes = [...upcomingIncomes].sort((a, b) => 
    new Date(a.nextPayDate) - new Date(b.nextPayDate)
  );
  
  const sortedBills = [...upcomingBills].sort((a, b) => 
    new Date(a.dueDate) - new Date(b.dueDate)
  );

  const calculateMonthlyIncome = () => {
    return incomes.reduce((total, income) => {
      // If it's a recurring income source
      if (income.isRecurring) {
        switch (income.frequency) {
          case 'WEEKLY':
            return total + (income.amount * 52) / 12;
          case 'BIWEEKLY':
            return total + (income.amount * 26) / 12;
          case 'MONTHLY':
            return total + income.amount;
          case 'QUARTERLY':
            return total + income.amount / 3;
          case 'ANNUAL':
            return total + income.amount / 12;
          default:
            return total;
        }
      } else {
        // For one-time entries, only include if they're in the current month
        const incomeDate = new Date(income.date || income.nextPayDate);
        if (isThisMonth(incomeDate)) {
          return total + income.amount;
        }
        return total;
      }
    }, 0);
  };

  const scrollableContainerStyle = {
    mb: 3,
    maxHeight: '30%',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '4px',
      '&:hover': {
        background: '#555',
      },
    },
  };

  const renderIncomeTooltipContent = (income) => (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        {income.name}
      </Typography>
      <Typography variant="body2">
        Amount: {formatAmount(income.amount)}
      </Typography>
      {income.isRecurring && (
        <Typography variant="body2">
          Frequency: {income.frequency.toLowerCase()}
        </Typography>
      )}
      {income.description && (
        <Typography variant="body2">
          Note: {income.description}
        </Typography>
      )}
    </Box>
  );

  const renderBillTooltipContent = (bill) => (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        {bill.name}
      </Typography>
      <Typography variant="body2">
        Amount: {formatAmount(bill.amount)}
      </Typography>
      <Typography variant="body2">
        Category: {bill.category.name}
      </Typography>
      {bill.description && (
        <Typography variant="body2">
          Note: {bill.description}
        </Typography>
      )}
      <Typography variant="body2">
        Status: {bill.isPaid ? 'Paid' : 'Unpaid'}
      </Typography>
    </Box>
  );

  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with Totals */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          30-Day Financial Overview
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 2,
          mb: 2,
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Expected Income
            </Typography>
            <Typography variant="h6" color="success.main">
              {formatAmount(totalIncome)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Total Bills
            </Typography>
            <Typography variant="h6" color="error">
              {formatAmount(totalBills)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Unpaid Bills
            </Typography>
            <Typography variant="h6" color="warning.main">
              {formatAmount(totalUnpaid)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Remaining
            </Typography>
            <Typography 
              variant="h6" 
              color={totalIncome - totalBills >= 0 ? 'success.main' : 'error'}
            >
              {formatAmount(totalIncome - totalBills)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Income Section */}
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Expected Income
      </Typography>
      <Box sx={scrollableContainerStyle}>
        {sortedIncomes.map((income) => (
          <StyledTooltip
            key={income.id}
            title={renderIncomeTooltipContent(income)}
            placement="left"
            arrow
          >
            <Box
              sx={{
                p: 1,
                mb: 1,
                height: '60px',
                borderRadius: 1,
                bgcolor: 'background.paper',
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                }}
              />
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} noWrap>
                  {income.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Expected: {format(new Date(income.nextPayDate), 'MMM dd')}
                </Typography>
              </Box>

              <Typography variant="body2" color="success.main" sx={{ ml: 2 }}>
                {formatAmount(income.amount)}
              </Typography>
            </Box>
          </StyledTooltip>
        ))}
        {sortedIncomes.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No expected income in the next 30 days
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Bills Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Bills
        </Typography>
        <Typography variant="body2" color="error">
          {unpaidBills.length} unpaid ({formatAmount(totalUnpaid)})
        </Typography>
      </Box>
      <Box sx={scrollableContainerStyle}>
        {sortedBills.map((bill) => (
          <StyledTooltip
            key={bill.id}
            title={renderBillTooltipContent(bill)}
            placement="left"
            arrow
          >
            <Box
              sx={{
                p: 1,
                mb: 1,
                height: '60px',
                borderRadius: 1,
                bgcolor: 'background.paper',
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: bill.category.color,
                }}
              />
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} noWrap>
                  {bill.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Due: {format(new Date(bill.dueDate), 'MMM dd')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="error">
                  {formatAmount(bill.amount)}
                </Typography>
                <Chip
                  label={bill.isPaid ? "Paid" : "Unpaid"}
                  size="small"
                  color={bill.isPaid ? "success" : "warning"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (bill.isPaid) {
                      onUnpay?.(bill);
                    } else {
                      onMarkPaid?.(bill);
                    }
                  }}
                />
              </Box>
            </Box>
          </StyledTooltip>
        ))}
        {sortedBills.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No bills due in the next 30 days
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

FinancialOverview.defaultProps = {
  onMarkPaid: () => {},
  onUnpay: () => {},
};

export default FinancialOverview; 