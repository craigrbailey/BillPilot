import { Box, Grid, Paper, Typography, Chip } from '@mui/material';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import { formatAmount } from '../../../utils/formatters';

const MonthlyOverview = ({ monthlyBills, monthlyIncomes, onMarkBillPaid }) => {
  const theme = useTheme();
  const totalBills = monthlyBills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalIncome = monthlyIncomes.reduce((sum, income) => sum + income.amount, 0);

  const handleBillClick = async (bill) => {
    if (!bill.isPaid && window.confirm(`Mark "${bill.name}" as paid?`)) {
      await onMarkBillPaid(bill.id);
    }
  };

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom color="error">
            Upcoming Bills - Total: {formatAmount(totalBills)}
          </Typography>
          <Box sx={{ 
            overflowY: 'auto', 
            flex: 1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}>
            {monthlyBills.map((bill) => (
              <Box
                key={bill.id}
                onClick={() => handleBillClick(bill)}
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  opacity: bill.isPaid ? 0.6 : 1,
                  '&:hover': {
                    boxShadow: 3,
                    transform: bill.isPaid ? 'none' : 'translateY(-1px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {bill.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={bill.category.name}
                        size="small"
                        sx={{ 
                          backgroundColor: bill.category.color,
                          color: theme.palette.getContrastText(bill.category.color),
                        }}
                      />
                      {bill.isPaid && (
                        <Chip 
                          label="Paid" 
                          size="small" 
                          color="success"
                        />
                      )}
                      {bill.isRecurring && (
                        <Chip 
                          label="Recurring" 
                          size="small" 
                          color="info"
                        />
                      )}
                    </Box>
                  </Box>
                  <Typography 
                    variant="h6" 
                    color="error"
                    sx={{ minWidth: '100px', textAlign: 'right' }}
                  >
                    {formatAmount(bill.amount)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom color="success.main">
            Expected Income - Total: {formatAmount(totalIncome)}
          </Typography>
          <Box sx={{ 
            overflowY: 'auto', 
            flex: 1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}>
            {monthlyIncomes.map((income) => (
              <Box
                key={income.id}
                sx={{
                  p: 2,
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {income.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expected: {format(new Date(income.nextPayDate), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {income.frequency.charAt(0) + income.frequency.slice(1).toLowerCase().replace('_', ' ')}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h6" 
                    color="success.main"
                    sx={{ minWidth: '100px', textAlign: 'right' }}
                  >
                    {formatAmount(income.amount)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default MonthlyOverview; 