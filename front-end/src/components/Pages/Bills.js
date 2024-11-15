import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, isSameMonth, isSameDay } from 'date-fns';
import * as api from '../../utils/api';
import BillDialog from '../Bills/BillDialog';
import { useTheme } from '@mui/material/styles';

const Bills = () => {
  const theme = useTheme();
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBillsData = async () => {
    try {
      setLoading(true);
      const data = await api.fetchBills();
      setBills(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillsData();
  }, []);

  const handleCreateBill = async (billData) => {
    try {
      setError(null);
      const response = await api.createBill(billData);
      await fetchBillsData();
      setDialogOpen(false);
    } catch (err) {
      console.error('Error creating bill:', err);
      setError(err.message || 'Failed to create bill');
    }
  };

  const handleUpdateBill = async (billData) => {
    try {
      await api.updateBill(selectedBill.id, billData);
      fetchBillsData();
      setDialogOpen(false);
      setSelectedBill(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBill = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await api.deleteBill(id);
        fetchBillsData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredBills = bills.filter(
    (bill) =>
      bill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (isSameMonth(new Date(bill.dueDate), selectedDate) ||
        isSameDay(new Date(bill.dueDate), selectedDate))
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search bills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedBill(null);
            setDialogOpen(true);
          }}
        >
          Add Bill
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <DatePicker
          views={['day']}
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          renderInput={(params) => (
            <TextField {...params} fullWidth helperText={null} />
          )}
        />
      </Paper>

      <Paper>
        <List>
          {filteredBills.map((bill) => (
            <ListItem key={bill.id} divider>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {bill.name}
                    <Chip
                      label={bill.category.name}
                      size="small"
                      sx={{ 
                        backgroundColor: bill.category.color,
                        color: theme.palette.getContrastText(bill.category.color),
                      }}
                    />
                    {bill.isPaid && (
                      <Chip label="Paid" size="small" color="success" />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                    <br />
                    Amount: ${parseFloat(bill.amount).toFixed(2)}
                    {bill.balance !== null &&
                      ` (Balance: $${parseFloat(bill.balance).toFixed(2)})`}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    setSelectedBill(bill);
                    setDialogOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteBill(bill.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {filteredBills.length === 0 && (
            <ListItem>
              <ListItemText
                primary={
                  <Typography align="center">
                    No bills found for the selected criteria
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Paper>

      <BillDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedBill(null);
        }}
        onSubmit={selectedBill ? handleUpdateBill : handleCreateBill}
        initialData={selectedBill}
      />
    </Box>
  );
};

export default Bills; 