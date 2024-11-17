import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import { format, addDays, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { formatAmount } from '../../utils/formatters';

const FinancialOverview = ({ 
  incomes, 
  bills, 
  onMarkPaid, 
  onUnpay 
}) => {
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
      <Box 
        sx={{ 
          mb: 3,
          maxHeight: '200px',
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
        }}
      >
        {sortedIncomes.map((income) => (
          <Box
            key={income.id}
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
      <Box 
        sx={{ 
          flex: 1,
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
        }}
      >
        {sortedBills.map((bill) => (
          <Box
            key={bill.id}
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
                onClick={() => {
                  if (bill.isPaid) {
                    onUnpay(bill);
                  } else {
                    onMarkPaid(bill);
                  }
                }}
              />
            </Box>
          </Box>
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

export default FinancialOverview; 