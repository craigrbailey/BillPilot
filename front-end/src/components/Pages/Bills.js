import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import * as api from '../../utils/api';
import { format } from 'date-fns';
import { formatAmount } from '../../utils/formatters';
import PayeeDialog from '../Bills/PayeeDialog';
import BillDialog from '../Bills/BillDialog';
import BillPaymentDialog from '../Bills/BillPaymentDialog';
import BillUnpayDialog from '../Bills/BillUnpayDialog';

const Bills = () => {
  const [payees, setPayees] = useState([]);
  const [bills, setBills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [payeeDialog, setPayeeDialog] = useState({ open: false, data: null });
  const [billDialog, setBillDialog] = useState({ open: false, data: null });
  const [paymentDialog, setPaymentDialog] = useState({ open: false, bill: null });
  const [unpayDialog, setUnpayDialog] = useState({ open: false, bill: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payeesData, billsData, categoriesData] = await Promise.all([
        api.fetchPayees(),
        api.fetchBills(),
        api.fetchCategories(),
      ]);
      setPayees(payeesData);
      setBills(billsData);
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

  const handleDeletePayee = async (id) => {
    if (window.confirm('Are you sure you want to delete this payee? This will also delete all associated bills.')) {
      try {
        await api.deletePayee(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete payee');
        console.error(err);
      }
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

  const handlePaymentSubmit = async (paymentDate) => {
    try {
      await api.updateBill(paymentDialog.bill.id, {
        ...paymentDialog.bill,
        isPaid: true,
        paidDate: paymentDate,
      });
      fetchData();
      setPaymentDialog({ open: false, bill: null });
    } catch (error) {
      setError('Failed to mark bill as paid');
      console.error(error);
    }
  };

  const handleUnpayBill = async (bill) => {
    try {
      await api.updateBill(bill.id, { ...bill, isPaid: false, paidDate: null });
      fetchData();
      setUnpayDialog({ open: false, bill: null });
    } catch (error) {
      setError('Failed to unmark bill as paid');
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} direction="column">
        {/* Payees Section */}
        <Grid item xs={12}>
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
                          Expected: {formatAmount(payee.expectedAmount)} ({payee.frequency.toLowerCase()})
                        </Typography>
                        <Typography variant="body2">
                          Category: {payee.category.name}
                        </Typography>
                        <Typography variant="body2">
                          Started: {format(new Date(payee.startDate), 'MMM dd, yyyy')}
                        </Typography>
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
              {payees.length === 0 && (
                <ListItem>
                  <ListItemText
                    secondary="No payees added yet"
                    sx={{ textAlign: 'center', fontStyle: 'italic' }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Bills Section */}
        <Grid item xs={12}>
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
                    primary={bill.isOneTime ? bill.payeeName : bill.payee?.name}
                    secondary={
                      <>
                        <Typography variant="body2">
                          Amount: {formatAmount(bill.amount)}
                        </Typography>
                        <Typography variant="body2">
                          Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="body2">
                          Category: {bill.category.name}
                        </Typography>
                        {bill.description && (
                          <Typography variant="body2">
                            Note: {bill.description}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={bill.isPaid ? "Paid" : "Unpaid"}
                      size="small"
                      color={bill.isPaid ? "success" : "warning"}
                      onClick={() => {
                        if (bill.isPaid) {
                          setUnpayDialog({ open: true, bill });
                        } else {
                          setPaymentDialog({ open: true, bill });
                        }
                      }}
                    />
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
                  </Box>
                </ListItem>
              ))}
              {bills.length === 0 && (
                <ListItem>
                  <ListItemText
                    secondary="No bills recorded yet"
                    sx={{ textAlign: 'center', fontStyle: 'italic' }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <PayeeDialog
        open={payeeDialog.open}
        onClose={() => setPayeeDialog({ open: false, data: null })}
        onSubmit={handlePayeeSubmit}
        initialData={payeeDialog.data}
        categories={categories}
      />

      <BillDialog
        open={billDialog.open}
        onClose={() => setBillDialog({ open: false, data: null })}
        onSubmit={handleBillSubmit}
        initialData={billDialog.data}
        payees={payees}
        categories={categories}
      />

      <BillPaymentDialog
        open={paymentDialog.open}
        bill={paymentDialog.bill}
        onClose={() => setPaymentDialog({ open: false, bill: null })}
        onSubmit={handlePaymentSubmit}
      />

      <BillUnpayDialog
        open={unpayDialog.open}
        bill={unpayDialog.bill}
        onClose={() => setUnpayDialog({ open: false, bill: null })}
        onConfirm={() => handleUnpayBill(unpayDialog.bill)}
      />
    </Box>
  );
};

export default Bills; 