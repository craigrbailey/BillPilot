import { Box, Paper, Typography, Grid, Chip, IconButton } from '@mui/material';
import { format, isSameDay, addWeeks, subWeeks } from 'date-fns';
import StyledTooltip from '../StyledComponents/StyledTooltip';
import { useTheme } from '@mui/material/styles';
import { formatAmount } from '../../../utils/formatters';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const WeekView = ({ 
  weekDays, 
  bills, 
  incomes, 
  getItemsForDate, 
  onMarkBillPaid, 
  onUnpayBill,
  onWeekChange
}) => {
  const theme = useTheme();

  const handleBillClick = async (bill, event) => {
    event.stopPropagation();
    if (bill.isPaid) {
      onUnpayBill(bill);
    } else {
      onMarkBillPaid(bill);
    }
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
    <Paper sx={{ p: 2, mb: 3 }}>
      {/* Week Navigation Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <IconButton onClick={() => onWeekChange(subWeeks(weekDays[0], 1))}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </Typography>
        <IconButton onClick={() => onWeekChange(addWeeks(weekDays[0], 1))}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Days Row */}
        <Grid container spacing={2}>
          {weekDays.map((day) => (
            <Grid item xs key={day.toString()}>
              <Box 
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
              </Box>
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
                  {/* Income Items */}
                  {incomeDueToday.map((income) => (
                    <StyledTooltip
                      key={income.id}
                      title={renderIncomeTooltipContent(income)}
                      placement="right"
                      arrow
                    >
                      <Box
                        sx={{
                          p: 1,
                          mb: 1,
                          height: '60px',
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                          display: 'flex',
                          alignItems: 'center',
                          position: 'relative',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
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
                          <Typography variant="body2" color="success.main" noWrap>
                            {formatAmount(income.amount)}
                          </Typography>
                        </Box>
                      </Box>
                    </StyledTooltip>
                  ))}

                  {/* Bill Items */}
                  {billsDueToday.map((bill) => (
                    <StyledTooltip
                      key={bill.id}
                      title={renderBillTooltipContent(bill)}
                      placement="right"
                      arrow
                    >
                      <Box
                        sx={{
                          p: 1,
                          mb: 1,
                          height: '60px',
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          position: 'relative',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
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
                        
                        <Box sx={{ flex: 1, mr: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} noWrap>
                            {bill.name}
                          </Typography>
                          <Typography variant="body2" color="error" noWrap>
                            {formatAmount(bill.amount)}
                          </Typography>
                        </Box>

                        <Chip
                          label={bill.isPaid ? "Paid" : "Unpaid"}
                          size="small"
                          color={bill.isPaid ? "success" : "warning"}
                          onClick={(e) => handleBillClick(bill, e)}
                          sx={{ 
                            height: '24px',
                            minWidth: '70px',
                          }}
                        />
                      </Box>
                    </StyledTooltip>
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

export default WeekView; 