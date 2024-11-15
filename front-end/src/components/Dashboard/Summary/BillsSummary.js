import { Box, Paper, Typography, Chip } from '@mui/material';
import { format } from 'date-fns';
import { useTheme } from '@mui/material/styles';

const BillsSummary = ({ selectedDate, bills, getFutureBills, getItemsForDate, onMarkBillPaid }) => {
  const theme = useTheme();

  const handleBillClick = async (bill) => {
    if (!bill.isPaid && window.confirm(`Mark "${bill.name}" as paid?`)) {
      await onMarkBillPaid(bill.id);
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Summary
      </Typography>
      <Typography variant="body1" gutterBottom>
        Selected Date: {format(selectedDate, 'MMMM d, yyyy')}
      </Typography>
      
      {/* Due Today Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Bills Due Today:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {getItemsForDate(selectedDate, bills).map((bill) => (
            <Chip
              key={bill.id}
              label={`${bill.name} - $${bill.amount}`}
              onClick={() => handleBillClick(bill)}
              sx={{ 
                m: 0.5,
                backgroundColor: bill.category.color,
                color: theme.palette.getContrastText(bill.category.color),
                opacity: bill.isPaid ? 0.6 : 1,
                cursor: 'pointer',
                '&:hover': {
                  opacity: bill.isPaid ? 0.6 : 0.8,
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Future Bills Section */}
      <Typography variant="subtitle1" gutterBottom>
        Upcoming Bills:
      </Typography>
      <Box 
        sx={{ 
          flex: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      >
        {getFutureBills(bills).map((bill) => (
          <Box
            key={bill.id}
            onClick={() => handleBillClick(bill)}
            sx={{
              p: 1.5,
              mb: 1,
              borderRadius: 1,
              bgcolor: 'background.default',
              boxShadow: 1,
              cursor: 'pointer',
              opacity: bill.isPaid ? 0.6 : 1,
              '&:hover': {
                boxShadow: 3,
                transform: bill.isPaid ? 'none' : 'translateY(-1px)',
              },
              transition: 'all 0.2s',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {bill.name}
                  {bill.isPaid && ' (Paid)'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                </Typography>
                <Chip
                  label={bill.category.name}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    mt: 0.5,
                    backgroundColor: bill.category.color,
                    color: theme.palette.getContrastText(bill.category.color),
                  }}
                />
              </Box>
              <Typography 
                variant="subtitle2" 
                color="error"
                sx={{ fontWeight: 'bold' }}
              >
                ${parseFloat(bill.amount).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default BillsSummary; 