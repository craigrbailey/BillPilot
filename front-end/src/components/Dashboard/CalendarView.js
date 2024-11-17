import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
} from '@mui/material';
import { StaticDatePicker, PickersDay } from '@mui/x-date-pickers';
import { format, isSameMonth, isSameYear, setMonth, setYear, addMonths, subMonths } from 'date-fns';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate years (current year - 2 to current year + 2)
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
};

const CalendarView = ({ 
  selectedDate, 
  onDateChange, 
  renderDay, 
  bills, 
  incomes 
}) => {
  const [years] = useState(generateYears());
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const handleYearClick = (year) => {
    onDateChange(setYear(selectedDate, year));
  };

  const handleMonthClick = (monthIndex) => {
    onDateChange(setMonth(selectedDate, monthIndex));
  };

  const handlePreviousMonth = () => {
    onDateChange(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    onDateChange(addMonths(selectedDate, 1));
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      {/* Years Column */}
      <Box 
        sx={{ 
          width: '100px',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '8px',
          marginRight: '-8px',
          '&::-webkit-scrollbar': {
            width: '8px',
            display: 'none',
          },
          '&:hover::-webkit-scrollbar': {
            display: 'block',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.main',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          },
        }}
      >
        <List disablePadding>
          {years.map(year => (
            <ListItemButton
              key={year}
              selected={isSameYear(selectedDate, new Date(year, 0))}
              onClick={() => handleYearClick(year)}
              sx={{
                py: 1,
                minHeight: '48px',
                justifyContent: 'center',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemText 
                primary={year} 
                primaryTypographyProps={{ 
                  align: 'center',
                  variant: 'body2',
                  fontWeight: isSameYear(selectedDate, new Date(year, 0)) ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Months Column */}
      <Box 
        sx={{ 
          width: '120px',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '8px',
          marginRight: '-8px',
          '&::-webkit-scrollbar': {
            width: '8px',
            display: 'none',
          },
          '&:hover::-webkit-scrollbar': {
            display: 'block',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'primary.main',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          },
        }}
      >
        <List disablePadding>
          {MONTHS.map((month, index) => (
            <ListItemButton
              key={month}
              selected={isSameMonth(selectedDate, new Date(currentYear, index))}
              onClick={() => handleMonthClick(index)}
              sx={{
                py: 1,
                minHeight: '48px',
                justifyContent: 'center',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemText 
                primary={format(new Date(currentYear, index), 'MMM')}
                primaryTypographyProps={{ 
                  align: 'center',
                  variant: 'body2',
                  fontWeight: currentMonth === index ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Calendar */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Month Navigation */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          px: 2,
        }}>
          <IconButton onClick={handlePreviousMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6">
            {format(selectedDate, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Calendar Grid */}
        <Box sx={{ 
          flex: 1,
          '& .MuiPickersStaticWrapper-root': {
            height: '100%',
            minHeight: 'unset',
            background: 'transparent',
          },
          '& .MuiPickersLayout-root': {
            height: '100%',
            background: 'transparent',
          },
          '& .MuiDateCalendar-root': {
            height: '100%',
            width: '100%',
            maxHeight: 'none',
            background: 'transparent',
          },
          '& .MuiPickersCalendarHeader-root': {
            display: 'none',
          },
          '& .MuiDayCalendar-header': {
            justifyContent: 'space-around',
            '& .MuiTypography-root': {
              fontWeight: 'bold',
            },
          },
          '& .MuiDayCalendar-monthContainer': {
            height: 'calc(100% - 32px)', // Subtract header height
            overflow: 'visible', // Prevent scrolling
          },
          '& .MuiDayCalendar-slideTransition': {
            overflow: 'visible', // Prevent scrolling
            minHeight: 'unset',
          },
          '& .MuiDayCalendar-weekContainer': {
            justifyContent: 'space-around',
            margin: '4px 0',
            minHeight: 0, // Allow container to shrink
          },
          '& .MuiPickersDay-root': {
            margin: '2px',
            width: '36px', // Slightly smaller day size
            height: '36px',
            fontSize: '0.875rem',
            '&:hover': {
              bgcolor: 'action.hover',
            },
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            },
          },
          '& .MuiPaper-root': {
            background: 'transparent',
            boxShadow: 'none',
          },
        }}>
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            value={selectedDate}
            onChange={onDateChange}
            renderDay={renderDay}
            showToolbar={false}
            slots={{
              day: (props) => {
                const { key, ...otherProps } = props;
                return <PickersDay key={key} {...otherProps} />;
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CalendarView; 