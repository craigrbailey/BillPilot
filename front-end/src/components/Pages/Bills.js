import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import * as api from '../../utils/api';
import BillDialog from '../Bills/BillDialog';
import PayeeDialog from '../Bills/PayeeDialog';
import { format } from 'date-fns';
import { formatAmount } from '../../utils/formatters';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [payees, setPayees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billDialog, setBillDialog] = useState({ open: false, data: null });
  const [payeeDialog, setPayeeDialog] = useState({ open: false, data: null });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsData, payeesData, categoriesData] = await Promise.all([
        api.fetchBills(),
        api.fetchPayees(),
        api.fetchCategories(),
      ]);
      setBills(billsData);
      setPayees(payeesData || []);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError('Failed to load bills data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBillSubmit = async (data) => {
    try {
      if (billDialog.data) {
        await api.updateBill(billDialog.data.id, data);
      } else {
        await api.createBill(data);
      }
      fetchData();
      setBillDialog({ open: false, data: null });
    } catch (err) {
      setError('Failed to save bill');
      console.error(err);
    }
  };

  const handlePayeeSubmit = async (data) => {
    try {
      if (payeeDialog.data) {
        await api.updatePayee(payeeDialog.data.id, data);
      } else {
        await api.createPayee(data);
      }
      fetchData();
      setPayeeDialog({ open: false, data: null });
    } catch (err) {
      setError('Failed to save payee');
      console.error(err);
    }
  };

  const handleDeleteBill = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await api.deleteBill(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete bill');
        console.error(err);
      }
    }
  };

  const handleDeletePayee = async (id) => {
    if (window.confirm('Are you sure you want to delete this payee?')) {
      try {
        await api.deletePayee(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete payee');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Payees Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Payees</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setPayeeDialog({ open: true, data: null })}
                variant="contained"
              >
                Add Payee
              </Button>
            </Box>
            <List>
              {payees.map((payee) => (
                <ListItem key={payee.id} divider>
                  <ListItemText
                    primary={payee.name}
                    secondary={
                      <>
                        <Typography variant="body2">
                          Expected: {formatAmount(payee.expectedAmount)} ({payee.frequency?.toLowerCase() || 'monthly'})
                        </Typography>
                        {payee.category && (
                          <Chip
                            label={payee.category.name}
                            size="small"
                            sx={{
                              bgcolor: payee.category.color,
                              color: 'white',
                              mt: 1,
                            }}
                          />
                        )}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => setPayeeDialog({ open: true, data: payee })}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeletePayee(payee.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Bills Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Bills</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setBillDialog({ open: true, data: null })}
                variant="contained"
              >
                Add Bill
              </Button>
            </Box>
            <List>
              {bills.map((bill) => (
                <ListItem key={bill.id} divider>
                  <ListItemText
                    primary={bill.name}
                    secondary={
                      <>
                        <Typography variant="body2">
                          Amount: {formatAmount(bill.amount)}
                        </Typography>
                        <Typography variant="body2">
                          Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                        </Typography>
                        {bill.category && (
                          <Chip
                            label={bill.category.name}
                            size="small"
                            sx={{
                              bgcolor: bill.category.color,
                              color: 'white',
                              mt: 1,
                            }}
                          />
                        )}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => setBillDialog({ open: true, data: bill })}
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
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <BillDialog
        open={billDialog.open}
        onClose={() => setBillDialog({ open: false, data: null })}
        onSubmit={handleBillSubmit}
        initialData={billDialog.data}
        payees={payees}
        categories={categories}
      />

      <PayeeDialog
        open={payeeDialog.open}
        onClose={() => setPayeeDialog({ open: false, data: null })}
        onSubmit={handlePayeeSubmit}
        initialData={payeeDialog.data}
        categories={categories}
      />
    </Box>
  );
};

export default Bills; 