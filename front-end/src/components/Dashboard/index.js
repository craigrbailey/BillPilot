import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  parseISO,
} from 'date-fns';
import * as api from '../../utils/api';
import MonthCalendar from './Calendar/MonthCalendar';
import WeekView from './Calendar/WeekView';
import BillsSummary from './Summary/BillsSummary';
import MonthlyOverview from './Summary/MonthlyOverview';

const Dashboard = () => {
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
``
  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkBillPaid = async (billId) => {
    try {
      await api.markBillPaid(billId);
      await fetchData(); // Refresh all data after marking bill as paid
    } catch (err) {
      setError('Failed to mark bill as paid');
      console.error(err);
    }
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
      .filter(bill => !bill.isPaid && new Date(bill.dueDate) > today)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
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
          <MonthCalendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            bills={bills}
            incomes={incomes}
            getItemsForDate={getItemsForDate}
            onMarkBillPaid={handleMarkBillPaid}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <BillsSummary
            selectedDate={selectedDate}
            bills={bills}
            getFutureBills={getFutureBills}
            getItemsForDate={getItemsForDate}
            onMarkBillPaid={handleMarkBillPaid}
          />
        </Grid>
      </Grid>

      <WeekView
        weekDays={weekDays}
        bills={bills}
        incomes={incomes}
        getItemsForDate={getItemsForDate}
        onMarkBillPaid={handleMarkBillPaid}
      />

      <MonthlyOverview
        monthlyBills={getItemsForInterval(monthInterval, bills)}
        monthlyIncomes={getItemsForInterval(monthInterval, incomes)}
        onMarkBillPaid={handleMarkBillPaid}
      />
    </Box>
  );
};

export default Dashboard; 