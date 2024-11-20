import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBills, markBillPaid, markBillUnpaid } from '../../utils/api/billsAPI';
import { fetchIncomeSources, fetchIncomeEntries } from '../../utils/api/incomeAPI';
import { checkAuth } from '../../utils/api/authAPI';
import { useNavigate } from 'react-router-dom';
import BillPaymentDialog from '../Bills/BillPaymentDialog';
import BillUnpayDialog from '../Bills/BillUnpayDialog';
import WeekView from '../Dashboard/Calendar/WeekView';
import MonthlyComparisonChart from '../Dashboard/MonthlyComparisonChart';
import FinancialOverview from '../Dashboard/FinancialOverview';
import { startOfWeek, addDays, isSameDay, format } from 'date-fns';
import { Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import StyledTooltip from '../Dashboard/StyledComponents/StyledTooltip';
import { formatAmount } from '../../utils/formatters';
import LatePaymentsPanel from '../Dashboard/Panels/LatePaymentsPanel';
import CategoryBreakdownPanel from '../Dashboard/Panels/CategoryBreakdownPanel';
import CashFlowForecastPanel from '../Dashboard/Panels/CashFlowForecastPanel';
import ComingSoonPanel from '../Dashboard/Panels/ComingSoonPanel';

// Custom styled Badge for calendar dots
const StyledBadge = styled(Badge)(({ theme, dotColor }) => ({
  '& .MuiBadge-dot': {
    backgroundColor: dotColor,
    width: 6,
    height: 6,
    borderRadius: '50%',
    marginTop: '2px',
  },
}));

// Styled container for multiple dots
const DotContainer = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  gap: '3px',
  justifyContent: 'center',
  position: 'absolute',
  bottom: '2px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
});

// Day wrapper component
const DayWrapper = styled('div')({
  position: 'relative',
  width: '36px',
  height: '36px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: '50%',
  },
});

// Add this helper function to format the tooltip content
const getTooltipContent = (date, activities, bills, incomes) => {
  const dayItems = [];

  // Get bills for this date
  bills.forEach(bill => {
    if (isSameDay(new Date(bill.dueDate), date)) {
      dayItems.push({
        type: 'Bill',
        name: bill.name,
        amount: bill.amount,
        category: bill.category?.name || 'Uncategorized',
        color: bill.category?.color || '#ff4444',
        isPaid: bill.isPaid
      });
    }
  });

  // Get incomes for this date
  incomes.forEach(income => {
    if (isSameDay(new Date(income.nextPayDate), date)) {
      dayItems.push({
        type: 'Income',
        name: income.name,
        amount: income.amount,
        color: '#4caf50'
      });
    }
  });

  if (dayItems.length === 0) return null;

  return (
    <Box sx={{ p: 1 }}>
      {dayItems.map((item, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: item.color,
              flexShrink: 0
            }}
          />
          <div>
            <Box sx={{ fontWeight: 'bold' }}>
              {item.name} ({item.type})
            </Box>
            <Box sx={{ fontSize: '0.875rem' }}>
              {formatAmount(item.amount)}
              {item.type === 'Bill' && (
                <span style={{ marginLeft: '4px', color: item.isPaid ? 'green' : 'inherit' }}>
                  {item.isPaid ? '(Paid)' : ''}
                </span>
              )}
            </Box>
            {item.type === 'Bill' && (
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                {item.category}
              </Box>
            )}
          </div>
        </Box>
      ))}
    </Box>
  );
};

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bills, setBills] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    bill: null
  });
  const [unpayDialog, setUnpayDialog] = useState({
    open: false,
    bill: null
  });
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [incomeSources, setIncomeSources] = useState([]);
  const [incomeEntries, setIncomeEntries] = useState([]);
  const navigate = useNavigate();

  // Get week days for the current week
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  // Helper function to get items for a specific date
  const getItemsForDate = (date, items) => {
    return items.filter(item => {
      const itemDate = new Date(item.dueDate || item.nextPayDate);
      return isSameDay(itemDate, date);
    });
  };

  const fetchData = async () => {
    try {
      if (!checkAuth()) {
        return;
      }

      setLoading(true);
      const [billsData, sourceData, entriesData] = await Promise.all([
        fetchBills(),
        fetchIncomeSources(),
        fetchIncomeEntries(),
      ]);
      setBills(billsData);
      setIncomeSources(sourceData);
      setIncomeEntries(entriesData);

      // Combine income sources and entries for components that expect the old format
      const combinedIncomes = [
        ...sourceData.map(source => ({
          ...source,
          isRecurring: true,
          nextPayDate: source.startDate, // You might want to calculate the actual next pay date
        })),
        ...entriesData.map(entry => ({
          ...entry,
          isRecurring: false,
          name: entry.sourceName || (entry.source?.name || 'One-time Income'),
          nextPayDate: entry.date,
        }))
      ];

      setIncomes(combinedIncomes);
      setError(null);
    } catch (err) {
      if (err.message === 'Authentication required') {
        navigate('/login');
      } else {
        setError('Failed to load dashboard data');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAsPaid = (bill) => {
    setPaymentDialog({
      open: true,
      bill: bill
    });
  };

  const handlePaymentDialogClose = () => {
    setPaymentDialog({
      open: false,
      bill: null
    });
  };

  const handlePaymentSubmit = async (paymentDate) => {
    try {
      const updatedBill = await markBillPaid(paymentDialog.bill.id, {
        ...paymentDialog.bill,
        isPaid: true,
        paymentDate: paymentDate
      });

      // Update bills state without fetching
      setBills(prevBills =>
        prevBills.map(bill =>
          bill.id === updatedBill.id ? updatedBill : bill
        )
      );

      handlePaymentDialogClose();
      setNotification({
        open: true,
        message: `${updatedBill.name} marked as paid`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to update payment status:', error);
      setNotification({
        open: true,
        message: 'Failed to mark bill as paid',
        severity: 'error'
      });
    }
  };

  const handleUnpayBill = async (bill) => {
    try {
      const updatedBill = await markBillUnpaid(bill.id, {
        ...bill,
        isPaid: false,
        paidDate: null
      });

      // Update bills state without fetching
      setBills(prevBills =>
        prevBills.map(b =>
          b.id === updatedBill.id ? updatedBill : b
        )
      );

      setUnpayDialog({ open: false, bill: null });
      setNotification({
        open: true,
        message: `${updatedBill.name} marked as unpaid`,
        severity: 'info'
      });
    } catch (error) {
      console.error('Failed to unmark bill as paid:', error);
      setNotification({
        open: true,
        message: 'Failed to unmark bill as paid',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleWeekChange = (newDate) => {
    setCurrentWeekStart(startOfWeek(newDate));
  };

  // Function to get activity indicators for a specific date
  const getDateActivities = (date) => {
    const activities = [];

    // Check for bills on this date
    bills.forEach(bill => {
      if (isSameDay(new Date(bill.dueDate), date)) {
        activities.push({
          type: 'bill',
          color: bill.category?.color || '#ff4444',
        });
      }
    });

    // Check for income on this date
    incomes.forEach(income => {
      if (isSameDay(new Date(income.nextPayDate), date)) {
        activities.push({
          type: 'income',
          color: '#4caf50', // Green for income
        });
      }
    });

    return activities;
  };

  // Calendar day renderer
  const renderDay = (date, selectedDates, pickersDayProps) => {
    const activities = getDateActivities(date);
    const { day, ...other } = pickersDayProps;
    const tooltipContent = getTooltipContent(date, activities, bills, incomes);

    const dayElement = (
      <DayWrapper>
        <div {...other}>
          {typeof day === 'object' ? format(day, 'd') : day}
        </div>
        {activities.length > 0 && (
          <DotContainer>
            {activities.map((activity, index) => (
              <div
                key={index}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: activity.color,
                }}
              />
            ))}
          </DotContainer>
        )}
      </DayWrapper>
    );

    return activities.length > 0 ? (
      <StyledTooltip
        title={tooltipContent}
        arrow
        placement="top"
      >
        {dayElement}
      </StyledTooltip>
    ) : dayElement;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 88px)',
        p: 3,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid 
        container 
        spacing={3} 
        sx={{ 
          display: 'flex',
          flexDirection: 'row',
          flexGrow: 1,
          height: '100%',
        }}
      >
        {/* Left Column - Week View, Panels, and Chart */}
        <Grid 
          container spacing={2}
          item  
          md={9} 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            gap: 2,
          }}
        >
          {/* Week View Container */}
          <Box sx={{ width: '100%' }}>
            <WeekView
              weekDays={weekDays}
              bills={bills}
              incomes={incomes}
              getItemsForDate={getItemsForDate}
              onMarkBillPaid={handleMarkAsPaid}
              onUnpayBill={(bill) => setUnpayDialog({ open: true, bill })}
              onWeekChange={handleWeekChange}
            />
          </Box>

          {/* Panels Container */}
          <Box>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <LatePaymentsPanel bills={bills} />
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CategoryBreakdownPanel bills={bills} />
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CashFlowForecastPanel bills={bills} incomes={incomes} />
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <ComingSoonPanel />
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Chart Container */}
          <Box sx={{ flex: '0 0 300px' }}>
            <Paper 
              elevation={3} 
              sx={{ 
                height: '100%',
                p: 2,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <MonthlyComparisonChart bills={bills} incomes={incomes} />
            </Paper>
          </Box>
        </Grid>

        {/* Right Column - Calendar and Financial Overview */}
        <Grid 
          item 
          xs={12} 
          md={3} 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            gap: 2,
          }}
        >
          {/* Calendar Container */}
          <Paper 
            elevation={3} 
            sx={{
              bgcolor: 'background.default',
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
              '& .MuiPickersStaticWrapper-root': {
                bgcolor: 'background.default',
                height: '100%',
              },
              '& .MuiPickersCalendarHeader-root': {
                bgcolor: 'background.default',
              },
              '& .MuiPickersDay-root': {
                bgcolor: 'background.default',
              },
              '& .MuiDayPicker-monthContainer': {
                height: '100%',
              },
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                value={selectedDate}
                onChange={setSelectedDate}
                renderDay={renderDay}
                sx={{
                  width: '100%',
                  height: '100%',
                  '& .MuiPickersCalendarHeader-root': {
                    paddingLeft: '8px',
                    paddingRight: '8px',
                  },
                  '& .MuiPickersDay-root': {
                    width: '36px',
                    height: '36px',
                    fontSize: '0.875rem',
                  },
                  '& .MuiDayPicker-header': {
                    '& .MuiTypography-root': {
                      fontSize: '0.75rem',
                    },
                  },
                  '& .MuiDayPicker-monthContainer': {
                    '& .MuiDayPicker-weekContainer': {
                      margin: '2px 0',
                    },
                  },
                  '& > div': {
                    height: '100%',
                  },
                }}
              />
            </LocalizationProvider>
          </Paper>

          {/* Financial Overview Container */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={bills.filter(b => b.isPaid).length}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ height: '100%' }}
              >
                <Paper 
                  elevation={3} 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <FinancialOverview
                    bills={bills}
                    incomes={incomes}
                    onMarkPaid={handleMarkAsPaid}
                    onUnpay={(bill) => setUnpayDialog({ open: true, bill })}
                  />
                </Paper>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <BillPaymentDialog
        open={paymentDialog.open}
        bill={paymentDialog.bill}
        onClose={handlePaymentDialogClose}
        onSubmit={handlePaymentSubmit}
      />

      <BillUnpayDialog
        open={unpayDialog.open}
        bill={unpayDialog.bill}
        onClose={() => setUnpayDialog({ open: false, bill: null })}
        onConfirm={() => handleUnpayBill(unpayDialog.bill)}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard; 