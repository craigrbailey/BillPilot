import { Box, Paper, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';
import { format, isSameDay, addDays } from 'date-fns';
import StyledTooltip from '../StyledComponents/StyledTooltip';
import { formatAmount } from '../../../utils/formatters';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { IconButton } from '@mui/material';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePreviousWeek = () => {
    const previousWeek = addDays(weekDays[0], -7);
    onWeekChange(previousWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = addDays(weekDays[0], 7);
    onWeekChange(nextWeek);
  };

  const renderEventBar = (item, index) => {
    const isIncome = !item.category;
    const barColor = isIncome ? theme.palette.success.main : item.category.color;
    
    const tooltipContent = (
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          {item.name}
        </Typography>
        <Typography variant="body2">
          {formatAmount(item.amount)}
        </Typography>
        {!isIncome && (
          <>
            <Typography variant="body2">
              Category: {item.category.name}
            </Typography>
            <Typography variant="body2">
              Status: {item.isPaid ? 'Paid' : 'Unpaid'}
            </Typography>
          </>
        )}
      </Box>
    );

    return (
      <StyledTooltip
        key={`${item.id}-${index}`}
        title={tooltipContent}
        placement="top"
        arrow
      >
        <Box
          onClick={() => !isIncome && (item.isPaid ? onUnpayBill(item) : onMarkBillPaid(item))}
          sx={{
            height: '28px',
            mb: 0.5,
            px: 1,
            borderRadius: '4px',
            backgroundColor: barColor,
            opacity: item.isPaid ? 0.6 : 1,
            color: theme.palette.getContrastText(barColor),
            display: 'flex',
            alignItems: 'center',
            cursor: !isIncome ? 'pointer' : 'default',
            transition: 'all 0.2s',
            '&:hover': {
              opacity: !isIncome ? 0.8 : 1,
              transform: !isIncome ? 'translateY(-1px)' : 'none',
            },
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          <Typography variant="caption" noWrap>
            {item.name} - {formatAmount(item.amount)}
          </Typography>
        </Box>
      </StyledTooltip>
    );
  };

  const renderDayColumn = (day, index) => {
    const billsDueToday = getItemsForDate(day, bills);
    const incomeDueToday = getItemsForDate(day, incomes);
    const allItems = [...incomeDueToday, ...billsDueToday];
    const isToday = isSameDay(day, new Date());

    return (
      <Grid 
        item 
        xs={12} 
        sm={true} 
        key={day.toString()}
        sx={{
          borderRight: index < 6 ? 1 : 0,
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            p: 1,
            height: '100%',
            borderBottom: isToday ? `2px solid ${theme.palette.primary.main}` : 'none',
          }}
        >
          <Typography 
            variant="subtitle2" 
            align="center"
            color={isToday ? 'primary' : 'textPrimary'}
            sx={{ fontWeight: isToday ? 'bold' : 'normal' }}
          >
            {format(day, 'EEE')}
          </Typography>
          <Typography 
            variant="h6" 
            align="center"
            color={isToday ? 'primary' : 'textPrimary'}
            sx={{ fontWeight: isToday ? 'bold' : 'normal' }}
          >
            {format(day, 'd')}
          </Typography>
          <Box
            sx={{
              mt: 1,
              height: '200px',
              overflowY: 'auto',
              overflowX: 'hidden',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: theme.palette.background.default,
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.divider,
                borderRadius: '3px',
              },
            }}
          >
            {allItems.map((item, index) => renderEventBar(item, index))}
          </Box>
        </Box>
      </Grid>
    );
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
        }}
      >
        <IconButton onClick={handlePreviousWeek}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </Typography>
        <IconButton onClick={handleNextWeek}>
          <ChevronRight />
        </IconButton>
      </Box>

      <Grid 
        container 
        spacing={0}
        sx={{ 
          flexGrow: 1,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        {weekDays.map((day, index) => renderDayColumn(day, index))}
      </Grid>
    </Paper>
  );
};

export default WeekView; 