import { Box, Paper, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import { formatAmount } from '../../../utils/formatters';
import { isAfter } from 'date-fns';

const LatePaymentsPanel = ({ bills }) => {
  const lateBills = bills.filter(bill => 
    !bill.isPaid && isAfter(new Date(), new Date(bill.dueDate))
  );

  const totalLateAmount = lateBills.reduce((sum, bill) => sum + Number(bill.amount), 0);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" gutterBottom color="error">
        Late Payments
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ flex: '0 0 auto', mr: 2 }}>
          <Typography variant="h4" color="error">
            {lateBills.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Overdue
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
            {formatAmount(totalLateAmount)}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, maxHeight: 120, overflowY: 'auto' }}>
          <List dense>
            {lateBills.map((bill) => (
              <ListItem
                key={bill.id}
                sx={{
                  py: 0.5,
                  px: 1,
                  mb: 0.5,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemText
                  primary={bill.name}
                  secondary={formatAmount(bill.amount)}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default LatePaymentsPanel; 