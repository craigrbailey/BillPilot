import { Box, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { formatAmount } from '../../../utils/formatters';

const CategoryBreakdownPanel = ({ bills }) => {
  const categoryTotals = bills.reduce((acc, bill) => {
    const categoryName = bill.category?.name || 'Uncategorized';
    const categoryColor = bill.category?.color || '#808080';
    
    if (!acc[categoryName]) {
      acc[categoryName] = {
        total: 0,
        color: categoryColor,
      };
    }
    acc[categoryName].total += Number(bill.amount);
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryTotals).map(([name, data]) => ({
    id: name,
    value: data.total,
    label: `${name} (${formatAmount(data.total)})`,
    color: data.color,
  }));

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
        color: 'white',
      }}>
        <PieChart
          series={[
            {
              data: pieChartData,
              highlightScope: { faded: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -30 },
            },
          ]}
          slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'bottom', horizontal: 'middle' },
              padding: 0,
              labelStyle: {
                fill: 'white',
                fontSize: 10,
              },
            },
          }}
          height={300}
          margin={{ right: 200 }}
        />
      </Box>
    </Box>
  );
};

export default CategoryBreakdownPanel; 