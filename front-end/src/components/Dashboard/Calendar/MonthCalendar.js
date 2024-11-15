import { Box, Paper, Typography, Badge } from '@mui/material';
import { StaticDatePicker, PickersDay } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { StyledTooltip } from '../StyledComponents/StyledTooltip';
import { useTheme } from '@mui/material/styles';

const MonthCalendar = ({ selectedDate, setSelectedDate, bills, incomes, getItemsForDate, onMarkBillPaid }) => {
  const theme = useTheme();

  const handleBillClick = async (bill, event) => {
    event.stopPropagation(); // Prevent calendar date selection
    if (!bill.isPaid && window.confirm(`Mark "${bill.name}" as paid?`)) {
      await onMarkBillPaid(bill.id);
    }
  };

  const renderDay = (day, _value, DayComponentProps) => {
    const billsDueToday = getItemsForDate(day, bills);
    const incomeDueToday = getItemsForDate(day, incomes);
    const hasBills = billsDueToday.length > 0;
    const hasIncome = incomeDueToday.length > 0;

    const tooltipContent = (
      <Box>
        {hasBills && (
          <Box sx={{ mb: hasIncome ? 1 : 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              Bills Due:
            </Typography>
            {billsDueToday.map((bill) => (
              <Box 
                key={bill.id} 
                sx={{ 
                  ml: 1,
                  cursor: 'pointer',
                  opacity: bill.isPaid ? 0.6 : 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={(e) => handleBillClick(bill, e)}
              >
                <Typography variant="body2">
                  {bill.name} - ${parseFloat(bill.amount).toFixed(2)}
                  {bill.isPaid && ' (Paid)'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Category: {bill.category.name}
                </Typography>
                {!bill.isPaid && (
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                    Click to mark as paid
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
        {hasIncome && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              Expected Income:
            </Typography>
            {incomeDueToday.map((income) => (
              <Box key={income.id} sx={{ ml: 1 }}>
                <Typography variant="body2">
                  {income.name} - ${parseFloat(income.amount).toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {income.frequency.charAt(0) + income.frequency.slice(1).toLowerCase().replace('_', ' ')}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );

    const dayElement = (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={
          (hasBills || hasIncome) ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '2px',
              position: 'absolute',
              top: '2px',
              right: '2px'
            }}>
              {billsDueToday.map((bill) => (
                <Box
                  key={bill.id}
                  sx={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: bill.category.color,
                    opacity: bill.isPaid ? 0.6 : 1,
                  }}
                />
              ))}
              {hasIncome && (
                <Box
                  sx={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'success.main',
                  }}
                />
              )}
            </Box>
          ) : null
        }
      >
        <PickersDay {...DayComponentProps} day={day} />
      </Badge>
    );

    return (hasBills || hasIncome) ? (
      <StyledTooltip 
        title={tooltipContent}
        placement="top"
        arrow
      >
        {dayElement}
      </StyledTooltip>
    ) : dayElement;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Monthly Overview
      </Typography>
      <StaticDatePicker
        displayStaticWrapperAs="desktop"
        value={selectedDate}
        onChange={(newValue) => setSelectedDate(newValue)}
        renderInput={(params) => <div {...params} />}
        renderDay={renderDay}
      />
    </Paper>
  );
};

export default MonthCalendar; 