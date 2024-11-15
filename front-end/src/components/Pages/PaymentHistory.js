import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import * as api from '../../utils/api';
import { formatAmount } from '../../utils/formatters';
import { useNotification } from '../../contexts/NotificationContext';
import ConfirmationDialog from '../Common/ConfirmationDialog';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    paymentId: null,
  });
  const { showNotification } = useNotification();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsData, categoriesData] = await Promise.all([
        api.fetchPaymentHistory(),
        api.fetchCategories(),
      ]);
      setPayments(paymentsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError('Failed to load payment history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeletePayment = async () => {
    try {
      await api.deletePayment(deleteDialog.paymentId);
      await fetchData();
      setDeleteDialog({ open: false, paymentId: null });
      showNotification('Payment deleted successfully');
    } catch (err) {
      setError('Failed to delete payment');
      showNotification('Failed to delete payment', 'error');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.bill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || payment.bill.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const totals = filteredPayments.reduce((acc, payment) => {
    const categoryId = payment.bill.categoryId;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: payment.bill.category,
        total: 0,
        count: 0,
      };
    }
    acc[categoryId].total += payment.amount;
    acc[categoryId].count += 1;
    return acc;
  }, {});

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

      {/* Summary Cards */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Summary
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 2,
          mt: 2,
        }}>
          {Object.values(totals).map(({ category, total, count }) => (
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
                {formatAmount(total)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {count} payment{count !== 1 ? 's' : ''}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search payments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Payments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bill Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.bill.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={payment.bill.category.name}
                    size="small"
                    sx={{ 
                      backgroundColor: payment.bill.category.color,
                      color: 'white'
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  {formatAmount(payment.amount)}
                </TableCell>
                <TableCell>
                  {format(new Date(payment.paidDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Delete Payment">
                    <IconButton
                      onClick={() => setDeleteDialog({ 
                        open: true, 
                        paymentId: payment.id 
                      })}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, paymentId: null })}
        onConfirm={handleDeletePayment}
        title="Delete Payment"
        message="Are you sure you want to delete this payment? This action cannot be undone."
      />
    </Box>
  );
};

export default PaymentHistory; 