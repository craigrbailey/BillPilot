import { Box, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { formatAmount } from '../../../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CashFlowForecastPanel = ({ bills, incomes }) => {
  const startDate = new Date();
  const endDate = addMonths(startDate, 3);
  
  const dates = eachDayOfInterval({ start: startDate, end: endDate });
  
  const dailyBalances = dates.map(date => {
    const income = incomes
      .filter(income => new Date(income.nextPayDate) <= date)
      .reduce((sum, income) => sum + Number(income.amount), 0);
    
    const expenses = bills
      .filter(bill => new Date(bill.dueDate) <= date)
      .reduce((sum, bill) => sum + Number(bill.amount), 0);
    
    return income - expenses;
  });

  const data = {
    labels: dates.map(date => format(date, 'MMM d')),
    datasets: [
      {
        label: 'Balance',
        data: dailyBalances,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Balance: ${formatAmount(context.raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 5,
          font: {
            size: 10
          }
        }
      },
      y: {
        ticks: {
          callback: (value) => formatAmount(value),
          font: {
            size: 10
          }
        }
      },
    },
  };

  return (
    <Box sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" gutterBottom>
        3-Month Forecast
      </Typography>
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        width: '100%',
        height: 'calc(100% - 30px)',
      }}>
        <Line data={data} options={options} />
      </Box>
    </Box>
  );
};

export default CashFlowForecastPanel; 