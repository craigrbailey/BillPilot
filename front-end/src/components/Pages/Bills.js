import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as PaidIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import * as api from '../../utils/api';
import BillDialog from '../Bills/BillDialog';
import { DatePicker } from '@mui/x-date-pickers';
import { formatAmount } from '../../utils/formatters';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import { useNotification } from '../../contexts/NotificationContext';
import BillHistoryPanel from '../Bills/BillHistoryPanel';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    billId: null,
  });
  const [deletePaymentDialog, setDeletePaymentDialog] = useState({
    open: false,
    paymentId: null,
  });
  const { showNotification } = useNotification();
  const [expandedBillId, setExpandedBillId] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    billId: null,
    isRecurring: false,
  });

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

  const fetchPaymentHistory = async () => {
    try {
      const data = await api.fetchPaymentHistory();
      setPayments(data);
    } catch (err) {
      setError('Failed to load payment history');
    }
  };

  useEffect(() => {
    fetchBillsData();
    fetchPaymentHistory();
  }, []);

  const handleCreateBill = async (billData) => {
    try {
      setError(null);
      await api.createBill(billData);
      await fetchBillsData();
      setDialogOpen(false);
      showNotification('Bill created successfully');
    } catch (err) {
      console.error('Error creating bill:', err);
      setError(err.message || 'Failed to create bill');
      showNotification('Failed to create bill', 'error');
    }
  };

  const handleUpdateBill = async (billData) => {
    try {
      await api.updateBill(selectedBill.id, billData);
      await fetchBillsData();
      setDialogOpen(false);
      setSelectedBill(null);
      showNotification('Bill updated successfully');
    } catch (err) {
      setError(err.message);
      showNotification('Failed to update bill', 'error');
    }
  };

  const handleDeleteBill = async (deleteAll = false) => {
    try {
      await api.deleteBill(deleteConfirmation.billId, deleteAll);
      await fetchBillsData();
      setDeleteConfirmation({ open: false, billId: null, isRecurring: false });
      showNotification('Bill deleted successfully');
    } catch (err) {
      setError(err.message);
      showNotification('Failed to delete bill', 'error');
    }
  };

  const handleMarkPaid = async (billId) => {
    try {
      await api.markBillPaid(billId, paymentDate.toISOString());
      await fetchBillsData();
      await fetchPaymentHistory();
      setPaymentDialogOpen(false);
      setSelectedBillForPayment(null);
      showNotification('Bill marked as paid');
    } catch (err) {
      setError('Failed to mark bill as paid');
      showNotification('Failed to mark bill as paid', 'error');
    }
  };

  const handleDeletePayment = async () => {
    try {
      await api.deletePayment(deletePaymentDialog.paymentId);
      await fetchPaymentHistory();
      await fetchBillsData();
      setError(null);
      setDeletePaymentDialog({ open: false, paymentId: null });
      showNotification('Payment deleted successfully');
    } catch (err) {
      console.error('Failed to delete payment:', err);
      setError('Failed to delete payment');
      showNotification('Failed to delete payment', 'error');
    }
  };

  const handleOpenDeleteDialog = (billId) => {
    setDeleteDialog({
      open: true,
      billId,
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      billId: null,
    });
  };

  const handleOpenDeletePaymentDialog = (paymentId) => {
    setDeletePaymentDialog({
      open: true,
      paymentId,
    });
  };

  const handleCloseDeletePaymentDialog = () => {
    setDeletePaymentDialog({
      open: false,
      paymentId: null,
    });
  };

  const filteredBills = bills.filter(bill =>
    bill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PaymentDialog = () => (
    <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
      <DialogTitle>Mark Bill as Paid</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <DatePicker
            label="Payment Date"
            value={paymentDate}
            onChange={(newValue) => setPaymentDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
            maxDate={new Date()}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
        <Button 
          onClick={() => handleMarkPaid(selectedBillForPayment.id)}
          variant="contained"
        >
          Confirm Payment
        </Button>
      </DialogActions>
    </Dialog>
  );

  const handlePaymentClick = (bill) => {
    setSelectedBillForPayment(bill);
    setPaymentDate(new Date());
    setPaymentDialogOpen(true);
  };

  const handleDeleteClick = (bill) => {
    if (bill.isRecurring || bill.parentId) {
      setDeleteConfirmation({
        open: true,
        billId: bill.id,
        isRecurring: true,
      });
    } else {
      setDeleteDialog({
        open: true,
        billId: bill.id,
      });
    }
  };

  const RecurringDeleteDialog = () => (
    <Dialog 
      open={deleteConfirmation.open} 
      onClose={() => setDeleteConfirmation({ open: false, billId: null, isRecurring: false })}
    >
      <DialogTitle>Delete Recurring Bill</DialogTitle>
      <DialogContent>
        <Typography>
          This is a recurring bill. Would you like to delete just this instance or all recurring instances?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setDeleteConfirmation({ open: false, billId: null, isRecurring: false })}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => handleDeleteBill(false)}
          color="warning"
        >
          Delete This Instance
        </Button>
        <Button 
          onClick={() => handleDeleteBill(true)}
          color="error"
        >
          Delete All Instances
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
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
        <Tooltip title="Add Bill" arrow>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedBill(null);
              setDialogOpen(true);
            }}
            sx={{ minWidth: 'unset', width: '48px', height: '48px', p: 0 }}
          >
            <AddIcon />
          </Button>
        </Tooltip>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBills.map((bill) => (
              <>
                <TableRow 
                  key={bill.id}
                  onClick={() => setExpandedBillId(expandedBillId === bill.id ? null : bill.id)}
                  sx={{ 
                    opacity: bill.isPaid ? 0.7 : 1,
                    bgcolor: bill.isPaid ? 'action.hover' : 'inherit',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <TableCell>{bill.name}</TableCell>
                  <TableCell align="right">${parseFloat(bill.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={bill.category.name}
                      size="small"
                      sx={{ 
                        backgroundColor: bill.category.color,
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>{format(new Date(bill.dueDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    {bill.isPaid ? (
                      <Chip 
                        label="Paid" 
                        size="small" 
                        color="success"
                      />
                    ) : (
                      <Chip 
                        label="Unpaid" 
                        size="small" 
                        color="warning"
                      />
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    {!bill.isPaid && (
                      <Tooltip title="Mark as Paid">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePaymentClick(bill);
                          }}
                          color="success"
                        >
                          <PaidIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBill({
                            ...bill,
                            dueDate: format(new Date(bill.dueDate), 'yyyy-MM-dd'),
                            categoryId: bill.category.id
                          });
                          setDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(bill);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                {expandedBillId === bill.id && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0 }}>
                      <BillHistoryPanel 
                        bill={bill}
                        payments={payments.filter(p => p.billId === bill.id)}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <BillDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedBill(null);
        }}
        onSubmit={selectedBill ? handleUpdateBill : handleCreateBill}
        initialData={selectedBill}
      />

      <PaymentDialog />

      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteBill}
        title="Delete Bill"
        message="Are you sure you want to delete this bill? This action cannot be undone."
      />

      <ConfirmationDialog
        open={deletePaymentDialog.open}
        onClose={handleCloseDeletePaymentDialog}
        onConfirm={handleDeletePayment}
        title="Delete Payment"
        message="Are you sure you want to delete this payment? This action cannot be undone."
      />

      <RecurringDeleteDialog />
    </Box>
  );
};

export default Bills; 