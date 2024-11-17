import React from 'react';
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
  BarChart,
  Bar,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { formatAmount } from '../../utils/formatters';

const CategoryAnalytics = ({ bills, categories }) => {
  const theme = useTheme();
  const [selectedCategories, setSelectedCategories] = useState(
    categories.map(cat => cat.id)
  );

  const handleCategoryToggle = (event, newCategories) => {
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

  // Format whole amounts
  const formatWholeAmount = (value) => {
    return `$${Math.round(value).toLocaleString()}`;
  };

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
            if (entry.dataKey === 'income') {
              return (
                <Typography 
                  key={index}
                  sx={{ 
                    color: 'success.main',
                    fontWeight: 'bold',
                  }}
                >
                  Income: {formatWholeAmount(entry.value)}
                </Typography>
              );
            }
            const category = categories.find(
              cat => `cat_${cat.id}` === entry.dataKey
            );
            if (!category) return null;
            return (
              <Typography 
                key={index}
                sx={{ 
                  color: category.color,
                  fontWeight: 'bold',
                }}
              >
                {category.name}: {formatWholeAmount(entry.value)}
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
    const monthsData = getLast12MonthsData();
    
    return categories.map(category => {
      // Calculate total amount for this category over all months
      const totalAmount = monthsData.reduce((sum, month) => {
        return sum + (month[category.name] || 0);
      }, 0);
      
      // Calculate average (total divided by 12 months)
      const average = totalAmount / 12;
      
      return {
        ...category,
        average,
      };
    }).sort((a, b) => b.average - a.average); // Sort by average amount descending
  };

  const monthlyAverages = getMonthlyAverages();

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Category Spending Over Time
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 4,
          alignItems: 'flex-start',
        }}>
          {/* Category Buttons */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 1,
            minWidth: '200px',
          }}>
            <ToggleButtonGroup
              value={selectedCategories}
              onChange={handleCategoryToggle}
              orientation="vertical"
              aria-label="category selection"
              exclusive={false}
              sx={{
                gap: 1,
                '& .MuiToggleButton-root': {
                  mb: 1,
                  borderRadius: 1,
                  border: 'none',
                },
                '& .MuiToggleButtonGroup-grouped': {
                  borderRadius: '8px !important',
                  mx: 0,
                  border: 'none',
                },
              }}
            >
              {categories.map(category => (
                <ToggleButton 
                  key={category.id} 
                  value={category.id}
                  sx={{ 
                    bgcolor: category.color,
                    opacity: selectedCategories.includes(category.id) ? 1 : 0.5,
                    color: 'white',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: category.color,
                      opacity: 0.8,
                    },
                    '&.Mui-selected': {
                      bgcolor: category.color,
                      opacity: 1,
                      '&:hover': {
                        bgcolor: category.color,
                        opacity: 0.9,
                      },
                    },
                  }}
                >
                  {category.name}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Chart */}
          <Box sx={{ flex: 1, height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data}
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
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
                  tickFormatter={formatWholeAmount}
                  tick={{ fill: theme.palette.text.primary }}
                  stroke={theme.palette.text.primary}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={false}
                />
                <Legend />
                {categories
                  .filter(category => selectedCategories.includes(category.id))
                  .map(category => (
                    <Bar
                      key={category.id}
                      dataKey={`cat_${category.id}`}
                      name={category.name}
                      fill={category.color}
                      stroke={category.color}
                      strokeWidth={1}
                      activeBar={false}
                    />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Paper>

      {/* Monthly Averages Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
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
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 1,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: category.color,
                }}
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {category.name}
              </Typography>
              <Typography variant="h5">
                {formatWholeAmount(category.average)}
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