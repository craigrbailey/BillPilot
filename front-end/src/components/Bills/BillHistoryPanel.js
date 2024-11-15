import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths, addMonths } from 'date-fns';
import { formatAmount } from '../../utils/formatters';
import { useTheme } from '@mui/material/styles';

const BillHistoryPanel = ({ bill, payments = [] }) => {
  const theme = useTheme();
  const [startDate, setStartDate] = useState(subMonths(new Date(), 11));

  const handlePrevious = () => {
    setStartDate(prev => subMonths(prev, 12));
  };

  const handleNext = () => {
    setStartDate(prev => addMonths(prev, 12));
  };

  // Get data for chart
  const getChartData = () => {
    const data = [];
    let currentDate = startDate;

    for (let i = 0; i < 12; i++) {
      const monthPayments = payments.filter(payment => 
        format(new Date(payment.paidDate), 'yyyy-MM') === format(currentDate, 'yyyy-MM')
      );

      data.push({
        month: format(currentDate, 'MMM yyyy'),
        amount: bill.amount,
        paid: monthPayments.length > 0 ? monthPayments[0].amount : null,
      });

      currentDate = addMonths(currentDate, 1);
    }

    return data;
  };

  const chartData = getChartData();
  const hasOlderPayments = payments.some(payment => 
    new Date(payment.paidDate) < startDate
  );
  const hasNewerPayments = payments.some(payment => 
    new Date(payment.paidDate) > addMonths(startDate, 11)
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      return (
        <Paper sx={{ p: 1.5, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2">{label}</Typography>
          <Typography color="text.secondary">
            Expected: {formatAmount(payload[0]?.value || 0)}
          </Typography>
          {payload[1]?.value && (
            <Typography color="success.main">
              Paid: {formatAmount(payload[1].value)}
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
      <Grid container spacing={3}>
        {/* Chart Section */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: '300px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <IconButton 
                onClick={handlePrevious}
                disabled={!hasOlderPayments}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>
                Payment History
              </Typography>
              <IconButton 
                onClick={handleNext}
                disabled={!hasNewerPayments}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: theme.palette.text.primary }}
                  stroke={theme.palette.text.primary}
                />
                <YAxis 
                  tickFormatter={(value) => formatAmount(value)}
                  tick={{ fill: theme.palette.text.primary }}
                  stroke={theme.palette.text.primary}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke={theme.palette.error.main} 
                  name="Expected"
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="paid" 
                  stroke={theme.palette.success.main} 
                  name="Paid"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Payment History List */}
        <Grid item xs={12} md={5}>
          <Paper 
            sx={{ 
              p: 2, 
              height: '300px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recent Payments
            </Typography>
            {payments.length > 0 ? (
              <List 
                sx={{ 
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
                    '&:hover': {
                      background: '#555',
                    },
                  },
                }}
              >
                {payments
                  .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate))
                  .map((payment, index) => (
                    <Box key={payment.id}>
                      <ListItem>
                        <ListItemText
                          primary={formatAmount(payment.amount)}
                          secondary={format(new Date(payment.paidDate), 'MMM dd, yyyy')}
                        />
                      </ListItem>
                      {index < payments.length - 1 && <Divider />}
                    </Box>
                  ))}
              </List>
            ) : (
              <Box 
                sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}
                >
                  No payment history available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BillHistoryPanel; 