import { Box, Paper, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { formatAmount } from '../../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryBreakdownPanel = ({ bills }) => {
  const categoryTotals = bills.reduce((acc, bill) => {
    const categoryName = bill.category?.name || 'Uncategorized';
    const categoryColor = bill.category?.color || '#gray';
    
    if (!acc[categoryName]) {
      acc[categoryName] = {
        total: 0,
        color: categoryColor,
      };
    }
    acc[categoryName].total += Number(bill.amount);
    return acc;
  }, {});

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals).map(cat => cat.total),
      backgroundColor: Object.values(categoryTotals).map(cat => cat.color),
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 10
          },
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, i) => ({
              text: `${label} (${formatAmount(datasets[0].data[i])})`,
              fillStyle: datasets[0].backgroundColor[i],
              index: i,
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = formatAmount(context.raw);
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <Box sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle2" gutterBottom>
        Category Breakdown
      </Typography>
      <Box sx={{ 
        flex: 1, 
        position: 'relative',
        width: '100%',
        height: 'calc(100% - 30px)', // Subtract header height
      }}>
        <Pie data={data} options={options} />
      </Box>
    </Box>
  );
};

export default CategoryBreakdownPanel; 