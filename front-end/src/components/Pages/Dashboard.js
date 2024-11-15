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
} from 'date-fns';
import * as api from '../../utils/api';
import { useTheme } from '@mui/material/styles';

const Dashboard = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bills, setBills] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 0 }),
    end: endOfWeek(selectedDate, { weekStartsOn: 0 }),
  });

  const monthInterval = {
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate),
  };

  useEffect(() => {
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

    fetchData();
  }, []);

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

  const WeekView = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        This Week
      </Typography>
      <Grid container spacing={2}>
        {weekDays.map((day) => (
          <Grid item xs key={day.toString()}>
            <Paper 
              elevation={isSameDay(day, new Date()) ? 3 : 1}
              sx={{ 
                p: 1,
                bgcolor: isSameDay(day, new Date()) ? 'primary.light' : 'background.paper',
              }}
            >
              <Typography variant="subtitle2" align="center">
                {format(day, 'EEE')}
              </Typography>
              <Typography variant="h6" align="center">
                {format(day, 'd')}
              </Typography>
              <Box sx={{ mt: 1 }}>
                {getItemsForDate(day, bills).map((bill) => (
                  <Chip
                    key={bill.id}
                    label={`${bill.name} - $${bill.amount}`}
                    size="small"
                    color="error"
                    sx={{ mb: 0.5, width: '100%' }}
                  />
                ))}
                {getItemsForDate(day, incomes).map((income) => (
                  <Chip
                    key={income.id}
                    label={`${income.name} - $${income.amount}`}
                    size="small"
                    color="success"
                    sx={{ mb: 0.5, width: '100%' }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
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
              Upcoming Bills - Total: ${totalBills.toFixed(2)}
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
                      ${parseFloat(bill.amount).toFixed(2)}
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
              Expected Income - Total: ${totalIncome.toFixed(2)}
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
                        {income.frequency.charAt(0) + income.frequency.slice(1).toLowerCase()}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h6" 
                      color="success.main"
                      sx={{ minWidth: '100px', textAlign: 'right' }}
                    >
                      ${parseFloat(income.amount).toFixed(2)}
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

  const renderDay = (day, _value, DayComponentProps) => {
    const billsDueToday = getItemsForDate(day, bills);
    const incomeDueToday = getItemsForDate(day, incomes);
    const hasBills = billsDueToday.length > 0;
    const hasIncome = incomeDueToday.length > 0;

    return (
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
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
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
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Typography variant="body1" gutterBottom>
              Selected Date: {format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
            
            {/* Due Today Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Due Today:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getItemsForDate(selectedDate, bills).map((bill) => (
                  <Chip
                    key={bill.id}
                    label={`${bill.name} - $${bill.amount}`}
                    color="error"
                    sx={{ m: 0.5 }}
                  />
                ))}
                {getItemsForDate(selectedDate, incomes).map((income) => (
                  <Chip
                    key={income.id}
                    label={`${income.name} - $${income.amount}`}
                    color="success"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Box>

            {/* Future Bills Section */}
            <Typography variant="subtitle1" gutterBottom>
              Upcoming Bills:
            </Typography>
            <Box 
              sx={{ 
                flex: 1,
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
              {getFutureBills(bills).map((bill) => (
                <Box
                  key={bill.id}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: 'background.default',
                    boxShadow: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {bill.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                      </Typography>
                      <Chip
                        label={bill.category.name}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          mt: 0.5,
                          backgroundColor: bill.category.color,
                          color: theme.palette.getContrastText(bill.category.color),
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="subtitle2" 
                      color="error"
                      sx={{ fontWeight: 'bold' }}
                    >
                      ${parseFloat(bill.amount).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {getFutureBills(bills).length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center">
                  No upcoming bills
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <WeekView />
      <MonthlyOverview />
    </Box>
  );
};

export default Dashboard; 