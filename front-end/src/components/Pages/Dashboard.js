import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Badge,
  Tooltip,
  IconButton,
  alpha,
} from '@mui/material';
import { StaticDatePicker, PickersDay } from '@mui/x-date-pickers';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  parseISO,
  addWeeks,
  subWeeks,
} from 'date-fns';
import * as api from '../../utils/api';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material';
import { markBillPaid } from '../../utils/api';
import MonthlyComparisonChart from '../Dashboard/MonthlyComparisonChart';
import MonthlyFinancialSummary from '../Dashboard/MonthlyFinancialSummary';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { formatAmount } from '../../utils/formatters';

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[4],
    padding: theme.spacing(1.5),
    maxWidth: 'none',
  },
}));

const Dashboard = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bills, setBills] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsData, incomesData] = await Promise.all([
        api.fetchBills(),
        api.fetchIncomes(),
      ]);
      setBills(billsData);
      setIncomes(incomesData);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkPaid = async (billId) => {
    try {
      await markBillPaid(billId);
      fetchData();
    } catch (error) {
      console.error('Failed to mark bill as paid:', error);
      setError('Failed to mark bill as paid');
    }
  };

  const handlePreviousWeek = () => {
    setSelectedDate(prevDate => subWeeks(prevDate, 1));
  };

  const handleNextWeek = () => {
    setSelectedDate(prevDate => addWeeks(prevDate, 1));
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 0 }),
    end: endOfWeek(selectedDate, { weekStartsOn: 0 }),
  });

  const monthInterval = {
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate),
  };

  const getItemsForDate = (date, items) => {
    return items.filter(item => 
      isSameDay(parseISO(item.dueDate || item.nextPayDate), date)
    );
  };

  const getItemsForInterval = (interval, items) => {
    return items.filter(item => 
      isWithinInterval(parseISO(item.dueDate || item.nextPayDate), interval)
    );
  };

  const getFutureBills = (bills) => {
    const today = new Date();
    return bills
      .filter(bill => new Date(bill.dueDate) > today)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  const WeekView = ({ bills, onMarkPaid }) => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton onClick={handlePreviousWeek}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </Typography>
        <IconButton onClick={handleNextWeek}>
          <ChevronRightIcon />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Days Row */}
        <Grid container spacing={2}>
          {weekDays.map((day) => (
            <Grid item xs key={day.toString()}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 2,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.background.paper, 0.6) 
                    : theme.palette.grey[50],
                  textAlign: 'center',
                  borderBottom: isSameDay(day, new Date()) 
                    ? '2px solid'
                    : '2px solid transparent',
                  borderColor: isSameDay(day, new Date()) 
                    ? 'primary.main'
                    : 'transparent',
                  transition: 'all 0.2s',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.divider, 0.1)
                    : theme.palette.divider,
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.background.paper, 0.8)
                      : theme.palette.grey[100],
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                  },
                  ...(isSameDay(day, new Date()) && {
                    bgcolor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.primary.main, 0.05),
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }),
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
                          {bill.notes && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mt: 1,
                                p: 1, 
                                bgcolor: 'action.hover',
                                borderRadius: 1,
                                fontStyle: 'italic'
                              }}
                            >
                              Note: {bill.notes}
                            </Typography>
                          )}
                          {bill.isPaid && (
                            <Typography variant="body2" color="success.main">
                              Status: Paid
                            </Typography>
                          )}
                        </Box>
                      }
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
                          border: `1px solid ${bill.category.color}`,
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }} noWrap>
                          {bill.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {formatAmount(bill.amount)}
                        </Typography>
                      </Box>
                    </StyledTooltip>
                  ))}

                  {/* Income */}
                  {incomeDueToday.map((income) => (
                    <StyledTooltip
                      key={income.id}
                      title={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            {income.name}
                          </Typography>
                          <Typography variant="body2">
                            Amount: {formatAmount(income.amount)}
                          </Typography>
                          <Typography variant="body2">
                            Frequency: {income.frequency.charAt(0) + income.frequency.slice(1).toLowerCase().replace('_', ' ')}
                          </Typography>
                          {income.lastPaid && (
                            <Typography variant="body2">
                              Last Paid: {format(new Date(income.lastPaid), 'MMM dd, yyyy')}
                            </Typography>
                          )}
                        </Box>
                      }
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
                          borderColor: 'success.main',
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }} noWrap>
                          {income.name}
                        </Typography>
                        <Typography variant="body2" color="success.main" noWrap>
                          {formatAmount(income.amount)}
                        </Typography>
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

  const MonthlyOverview = () => {
    const monthlyBills = getItemsForInterval(monthInterval, bills);
    const monthlyIncomes = getItemsForInterval(monthInterval, incomes);

    const totalBills = monthlyBills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalIncome = monthlyIncomes.reduce((sum, income) => sum + income.amount, 0);

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
                  sx={{
                    p: 2,
                    mb: 1,
                    height: '80px',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {bill.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                    </Typography>
                    {bill.isPaid && (
                      <Chip 
                        label="Paid" 
                        size="small" 
                        color="success" 
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                  <Typography 
                    variant="h6" 
                    color="error"
                    sx={{ minWidth: '100px', textAlign: 'right' }}
                  >
                    {formatAmount(bill.amount)}
                  </Typography>
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
                    height: '80px',
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {income.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expected: {format(new Date(income.nextPayDate), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {income.frequency === 'ONE_TIME' ? 'Single Payment' : 
                        income.frequency.charAt(0) + income.frequency.slice(1).toLowerCase().replace('_', ' ')
                      }
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
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
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
              <Box key={bill.id} sx={{ ml: 1 }}>
                <Typography variant="body2">
                  {bill.name} - {formatAmount(bill.amount)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Category: {bill.category.name}
                </Typography>
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
                  {income.name} - {formatAmount(income.amount)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {income.frequency.charAt(0) + income.frequency.slice(1).toLowerCase()}
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

  const monthlyBills = getItemsForInterval(monthInterval, bills);
  const monthlyIncomes = getItemsForInterval(monthInterval, incomes);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: '100%', 
      margin: '0 auto',
      p: 3,
      display: 'grid',
      gap: 3,
      gridTemplateColumns: 'repeat(12, 1fr)',
      '& > *': {
        minHeight: 0, // Prevents grid item overflow
      }
    }}>
      <Box sx={{ 
        gridColumn: 'span 12',
        textAlign: 'center',
        mb: 2,
      }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 'bold',
            mb: 0.5,
          }}
        >
          {format(currentTime, 'EEEE, MMMM d, yyyy')}
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 'medium',
          }}
        >
          {format(currentTime, 'h:mm a')}
        </Typography>
      </Box>

      {error && (
        <Box sx={{ gridColumn: 'span 12' }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {/* Monthly Summary - Full Width */}
      <Box sx={{ gridColumn: 'span 12' }}>
        <MonthlyFinancialSummary bills={bills} incomes={incomes} />
      </Box>

      {/* Chart and Calendar Side by Side */}
      <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 8' } }}>
        <MonthlyComparisonChart bills={bills} incomes={incomes} />
      </Box>

      <Box sx={{ gridColumn: { xs: 'span 12', lg: 'span 4' } }}>
        <Paper sx={{ p: 2, height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            Calendar Overview
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
            {/* Calendar */}
            <Box sx={{ flex: '0 0 auto' }}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                renderInput={(params) => <div {...params} />}
                renderDay={renderDay}
              />
            </Box>

            {/* Selected Day Items */}
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
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
            }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                {format(selectedDate, 'MMMM d, yyyy')}
              </Typography>

              {/* Bills Section */}
              {getItemsForDate(selectedDate, bills).length > 0 && (
                <>
                  <Typography variant="subtitle2" color="error" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Bills Due
                  </Typography>
                  {getItemsForDate(selectedDate, bills).map((bill) => (
                    <Box
                      key={bill.id}
                      sx={{
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        border: `1px solid ${bill.category.color}`,
                        opacity: bill.isPaid ? 0.7 : 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {bill.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {bill.category.name}
                        </Typography>
                        <Typography variant="body2" color="error">
                          {formatAmount(bill.amount)}
                        </Typography>
                      </Box>
                      {bill.isPaid && (
                        <Chip 
                          label="Paid" 
                          size="small" 
                          color="success" 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  ))}
                </>
              )}

              {/* Income Section */}
              {getItemsForDate(selectedDate, incomes).length > 0 && (
                <>
                  <Typography variant="subtitle2" color="success.main" sx={{ mt: 2, fontWeight: 'bold' }}>
                    Expected Income
                  </Typography>
                  {getItemsForDate(selectedDate, incomes).map((income) => (
                    <Box
                      key={income.id}
                      sx={{
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        border: '1px solid',
                        borderColor: 'success.main',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {income.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {income.frequency === 'ONE_TIME' ? 'Single Payment' : 
                            income.frequency.charAt(0) + income.frequency.slice(1).toLowerCase().replace('_', ' ')
                          }
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          {formatAmount(income.amount)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </>
              )}

              {/* No Items Message */}
              {getItemsForDate(selectedDate, bills).length === 0 && 
               getItemsForDate(selectedDate, incomes).length === 0 && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 2,
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}
                >
                  No items scheduled for this date
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Week View - Full Width */}
      <Box sx={{ gridColumn: 'span 12' }}>
        <WeekView bills={bills} onMarkPaid={handleMarkPaid} />
      </Box>

      {/* Bills and Income Side by Side */}
      <Box sx={{ 
        gridColumn: { xs: 'span 12', md: 'span 6' },
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom color="error">
            Upcoming Bills - Total: {formatAmount(monthlyBills.filter(bill => !bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0))}
          </Typography>
          <Box sx={{ 
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
          }}>
            {monthlyBills
              .filter(bill => !bill.isPaid)
              .map((bill) => (
                <Box
                  key={bill.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {bill.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Due: {format(new Date(bill.dueDate), 'MMM dd')}
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="error">
                    {formatAmount(bill.amount)}
                  </Typography>
                </Box>
              ))}
            {monthlyBills.filter(bill => !bill.isPaid).length === 0 && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  textAlign: 'center',
                  fontStyle: 'italic',
                  mt: 2
                }}
              >
                No upcoming bills
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>

      <Box sx={{ 
        gridColumn: { xs: 'span 12', md: 'span 6' },
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Paper sx={{ p: 2, height: '500px', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom color="success.main">
            Expected Income - Total: {formatAmount(monthlyIncomes.reduce((sum, income) => sum + income.amount, 0))}
          </Typography>
          <Box sx={{ 
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
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {income.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expected: {format(new Date(income.nextPayDate), 'MMM dd')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {income.frequency === 'ONE_TIME' ? 'Single Payment' : 
                      income.frequency.charAt(0) + income.frequency.slice(1).toLowerCase().replace('_', ' ')
                    }
                  </Typography>
                </Box>
                <Typography variant="h6" color="success.main">
                  {formatAmount(income.amount)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 