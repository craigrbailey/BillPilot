import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import BillPaymentDialog from '../Bills/BillPaymentDialog';
import BillUnpayDialog from '../Bills/BillUnpayDialog';
import CalendarView from '../Dashboard/CalendarView';
import WeekView from '../Dashboard/Calendar/WeekView';
import MonthlyComparisonChart from '../Dashboard/MonthlyComparisonChart';
import FinancialOverview from '../Dashboard/FinancialOverview';
import { startOfWeek, addDays, isSameDay } from 'date-fns';

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
      if (!api.checkAuth()) {
        return;
      }

      setLoading(true);
      const [billsData, incomesData] = await Promise.all([
        api.fetchBills(),
        api.fetchIncomes(),
      ]);
      setBills(billsData);
      setIncomes(incomesData);
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
      const updatedBill = await api.updateBill(paymentDialog.bill.id, {
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
      const updatedBill = await api.updateBill(bill.id, { 
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Content - Calendar and Chart */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            {/* Calendar */}
            <Grid item xs={12}>
              <CalendarView
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                bills={bills}
                incomes={incomes}
              />
            </Grid>

            {/* Week View */}
            <Grid item xs={12}>
              <WeekView
                weekDays={weekDays}
                bills={bills}
                incomes={incomes}
                getItemsForDate={getItemsForDate}
                onMarkBillPaid={handleMarkAsPaid}
                onUnpayBill={(bill) => setUnpayDialog({ open: true, bill })}
                onWeekChange={handleWeekChange}
              />
            </Grid>

            {/* Chart */}
            <Grid item xs={12}>
              <MonthlyComparisonChart bills={bills} incomes={incomes} />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column - Financial Overview */}
        <Grid item xs={12} md={3}>
          <AnimatePresence mode="wait">
            <motion.div
              key={bills.filter(b => b.isPaid).length}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FinancialOverview
                bills={bills}
                incomes={incomes}
                onMarkPaid={handleMarkAsPaid}
                onUnpay={(bill) => setUnpayDialog({ open: true, bill })}
              />
            </motion.div>
          </AnimatePresence>
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