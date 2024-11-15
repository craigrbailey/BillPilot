import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { formatAmount } from '../../utils/formatters';

const CategoryAnalytics = ({ bills, categories }) => {
  const theme = useTheme();
  const [selectedCategories, setSelectedCategories] = useState(
    categories.map(cat => cat.id)
  );

  const handleCategoryToggle = (event, newCategories) => {
    // Ensure at least one category is selected
    if (newCategories.length) {
      setSelectedCategories(newCategories);
    }
  };

  // Generate data for the last 12 months
  const getLast12MonthsData = () => {
    const monthsData = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthData = {
        month: format(date, 'MMM yyyy'),
      };

      // Calculate total for each category
      categories.forEach(category => {
        const categoryBills = bills.filter(bill => {
          const billDate = new Date(bill.dueDate);
          return (
            bill.categoryId === category.id &&
            billDate >= monthStart &&
            billDate <= monthEnd
          );
        });
        monthData[`cat_${category.id}`] = categoryBills.reduce(
          (sum, bill) => sum + Number(bill.amount),
          0
        );
      });

      monthsData.push(monthData);
    }

    return monthsData;
  };

  const data = getLast12MonthsData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
          <Typography variant="subtitle2" gutterBottom>{label}</Typography>
          {payload.map((entry, index) => {
            const category = categories.find(
              cat => `cat_${cat.id}` === entry.dataKey
            );
            return (
              <Typography 
                key={index}
                sx={{ 
                  color: category.color,
                  fontWeight: 'bold',
                }}
              >
                {category.name}: {formatAmount(entry.value)}
              </Typography>
            );
          })}
        </Paper>
      );
    }
    return null;
  };

  // Calculate monthly averages
  const getMonthlyAverages = () => {
    const totals = categories.map(category => {
      const categoryBills = bills.filter(bill => bill.categoryId === category.id);
      const total = categoryBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
      const average = total / 12; // Average over 12 months
      return {
        ...category,
        average,
      };
    });

    return totals.sort((a, b) => b.average - a.average);
  };

  const monthlyAverages = getMonthlyAverages();

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Category Spending Over Time
        </Typography>
        <Box sx={{ mb: 2 }}>
          <ToggleButtonGroup
            value={selectedCategories}
            onChange={handleCategoryToggle}
            aria-label="category selection"
            size="small"
          >
            {categories.map(category => (
              <ToggleButton 
                key={category.id} 
                value={category.id}
                sx={{ 
                  borderColor: category.color,
                  color: selectedCategories.includes(category.id) ? 'white' : category.color,
                  bgcolor: selectedCategories.includes(category.id) ? category.color : 'transparent',
                  '&:hover': {
                    bgcolor: selectedCategories.includes(category.id) 
                      ? category.color 
                      : `${category.color}22`,
                  },
                }}
              >
                {category.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme.palette.divider}
              />
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
              <Legend />
              {categories
                .filter(category => selectedCategories.includes(category.id))
                .map(category => (
                  <Line
                    key={category.id}
                    type="monotone"
                    dataKey={`cat_${category.id}`}
                    name={category.name}
                    stroke={category.color}
                    strokeWidth={2}
                    dot={{ fill: category.color }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Monthly Category Averages
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 2,
        }}>
          {monthlyAverages.map(category => (
            <Paper
              key={category.id}
              sx={{
                p: 2,
                border: `1px solid ${category.color}`,
                bgcolor: `${category.color}11`,
              }}
            >
              <Typography variant="subtitle1" sx={{ color: category.color, fontWeight: 'bold' }}>
                {category.name}
              </Typography>
              <Typography variant="h5" sx={{ color: category.color }}>
                {formatAmount(category.average)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Average per month
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default CategoryAnalytics; 