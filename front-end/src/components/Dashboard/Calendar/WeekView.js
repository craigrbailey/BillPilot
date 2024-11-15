import { Box, Paper, Typography, Grid } from '@mui/material';
import { format, isSameDay } from 'date-fns';
import { StyledTooltip } from '../StyledComponents/StyledTooltip';
import { useTheme } from '@mui/material/styles';
import { formatAmount } from '../../../utils/formatters';

const WeekView = ({ weekDays, bills, incomes, getItemsForDate, onMarkBillPaid }) => {
  const theme = useTheme();

  const handleBillClick = async (bill, event) => {
    console.log('Bill clicked:', bill);
    event.stopPropagation();
    if (!bill.isPaid && window.confirm(`Mark "${bill.name}" as paid?`)) {
      try {
        console.log('Attempting to mark bill as paid:', bill.id);
        await onMarkBillPaid(bill.id);
        console.log('Bill marked as paid successfully');
      } catch (error) {
        console.error('Failed to mark bill as paid:', error);
      }
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        This Week
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Days Row */}
        <Grid container spacing={2}>
          {weekDays.map((day) => (
            <Grid item xs key={day.toString()}>
              <Paper 
                elevation={1}
                sx={{ 
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.paper',
                  textAlign: 'center',
                  borderBottom: isSameDay(day, new Date()) 
                    ? '2px solid'
                    : '2px solid transparent',
                  borderColor: isSameDay(day, new Date()) 
                    ? 'primary.main'
                    : 'transparent',
                  transition: 'border-color 0.2s',
                }}
              >
                <Typography variant="h6">
                  {format(day, 'EEE')}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {format(day, 'd')}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Items Container */}
        <Grid container spacing={2}>
          {weekDays.map((day) => {
            const billsDueToday = getItemsForDate(day, bills);
            const incomeDueToday = getItemsForDate(day, incomes);

            return (
              <Grid item xs key={`items-${day.toString()}`}>
                <Box
                  sx={{
                    height: '300px',
                    overflowY: 'auto',
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
                  }}
                >
                  {/* Bills */}
                  {billsDueToday.map((bill) => (
                    <StyledTooltip
                      key={bill.id}
                      title={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {bill.name}
                          </Typography>
                          <Typography variant="body2">
                            Amount: {formatAmount(bill.amount)}
                          </Typography>
                          <Typography variant="body2">
                            Category: {bill.category.name}
                          </Typography>
                          {bill.balance !== null && (
                            <Typography variant="body2">
                              Balance: {formatAmount(bill.balance)}
                            </Typography>
                          )}
                          {bill.isPaid && (
                            <Typography variant="body2" color="success.main">
                              Status: Paid
                            </Typography>
                          )}
                          {!bill.isPaid && (
                            <Typography variant="body2" color="text.secondary">
                              Click to mark as paid
                            </Typography>
                          )}
                        </Box>
                      }
                      arrow
                      placement="top"
                    >
                      <Box
                        onClick={(e) => handleBillClick(bill, e)}
                        sx={{
                          p: 1,
                          mb: 1,
                          height: '60px',
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                          boxShadow: 1,
                          border: `1px solid ${bill.category.color}`,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          opacity: bill.isPaid ? 0.6 : 1,
                          '&:hover': {
                            boxShadow: 3,
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.2s',
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} noWrap>
                          {bill.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {formatAmount(bill.amount)}
                          {bill.isPaid && ' (Paid)'}
                        </Typography>
                      </Box>
                    </StyledTooltip>
                  ))}

                  {/* Income */}
                  {incomeDueToday.map((income) => (
                    <WeekViewItem
                      key={income.id}
                      item={income}
                      type="income"
                    />
                  ))}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Paper>
  );
};

const WeekViewItem = ({ item, type }) => {
  const tooltipContent = type === 'bill' ? (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
        {item.name}
      </Typography>
      <Typography variant="body2">
        Amount: {formatAmount(item.amount)}
      </Typography>
      <Typography variant="body2">
        Category: {item.category.name}
      </Typography>
      {item.balance !== null && (
        <Typography variant="body2">
          Balance: {formatAmount(item.balance)}
        </Typography>
      )}
      {item.isPaid && (
        <Typography variant="body2" color="success.main">
          Status: Paid
        </Typography>
      )}
    </Box>
  ) : (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
        {item.name}
      </Typography>
      <Typography variant="body2">
        Amount: {formatAmount(item.amount)}
      </Typography>
      <Typography variant="body2">
        Frequency: {item.frequency.charAt(0) + item.frequency.slice(1).toLowerCase().replace('_', ' ')}
      </Typography>
      {item.lastPaid && (
        <Typography variant="body2">
          Last Paid: {format(new Date(item.lastPaid), 'MMM dd, yyyy')}
        </Typography>
      )}
    </Box>
  );

  return (
    <StyledTooltip
      title={tooltipContent}
      arrow
      placement="top"
    >
      <Box
        sx={{
          p: 1,
          mb: 1,
          height: '60px',
          borderRadius: 1,
          bgcolor: 'background.paper',
          boxShadow: 1,
          border: '1px solid',
          borderColor: type === 'bill' ? item.category.color : 'success.main',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s',
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 'bold',
            color: type === 'income' ? 'success.main' : 'text.primary',
          }} 
          noWrap
        >
          {item.name}
        </Typography>
        <Typography 
          variant="body2" 
          color={type === 'income' ? 'success.main' : 'text.secondary'} 
          noWrap
        >
          {formatAmount(item.amount)}
        </Typography>
      </Box>
    </StyledTooltip>
  );
};

export default WeekView; 