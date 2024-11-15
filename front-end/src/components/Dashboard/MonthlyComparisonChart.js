import { Paper, Typography, Box } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { formatAmount } from '../../utils/formatters';
import { useTheme } from '@mui/material/styles';

const MonthlyComparisonChart = ({ bills, incomes }) => {
  const theme = useTheme();

  // Generate data for the last 12 months
  const getLast12MonthsData = () => {
    const monthsData = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      // Calculate total bills for the month
      const monthlyBills = bills.filter(bill => {
        const billDate = new Date(bill.dueDate);
        return billDate >= monthStart && billDate <= monthEnd;
      });
      const totalBills = monthlyBills.reduce((sum, bill) => sum + Number(bill.amount), 0);

      // Calculate total income for the month
      const monthlyIncome = incomes.filter(income => {
        const incomeDate = new Date(income.nextPayDate);
        return incomeDate >= monthStart && incomeDate <= monthEnd;
      });
      const totalIncome = monthlyIncome.reduce((sum, income) => sum + Number(income.amount), 0);

      monthsData.push({
        month: format(date, 'MMM yyyy'),
        bills: totalBills,
        income: totalIncome,
        difference: totalIncome - totalBills,
      });
    }

    return monthsData;
  };

  const data = getLast12MonthsData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const monthData = payload[0].payload;
      return (
        <Paper 
          sx={{ 
            p: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
            border: 1,
            borderColor: 'divider',
            boxShadow: theme.shadows[4],
          }}
        >
          <Typography variant="subtitle2">{label}</Typography>
          <Typography color="success.main">
            Income: {formatAmount(monthData.income)}
          </Typography>
          <Typography color="error.main">
            Bills: {formatAmount(monthData.bills)}
          </Typography>
          <Typography 
            sx={{ 
              color: monthData.difference >= 0 ? 'success.main' : 'error.main',
              fontWeight: 'bold'
            }}
          >
            Net: {formatAmount(monthData.difference)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper sx={{ p: 2, mb: 3, height: '400px' }}>
      <Typography variant="h6" gutterBottom>
        Monthly Income vs Bills
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={theme.palette.divider}
          />
          <XAxis 
            dataKey="month"
            tick={{ fontSize: 12, fill: theme.palette.text.primary }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
            stroke={theme.palette.text.primary}
          />
          <YAxis 
            tickFormatter={(value) => formatAmount(value)}
            tick={{ fontSize: 12, fill: theme.palette.text.primary }}
            stroke={theme.palette.text.primary}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ 
              fill: theme.palette.action.hover,
              opacity: 0.1,
            }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          <Bar 
            dataKey="income" 
            name="Income" 
            fill={theme.palette.success.main}
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="bills" 
            name="Bills" 
            fill={theme.palette.error.main}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default MonthlyComparisonChart; 