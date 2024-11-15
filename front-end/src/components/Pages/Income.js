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
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import * as api from '../../utils/api';
import IncomeDialog from '../Income/IncomeDialog';
import { formatAmount } from '../../utils/formatters';
import { useNotification } from '../../contexts/NotificationContext';

const getFrequencyDisplay = (frequency) => {
  switch (frequency) {
    case 'ONE_TIME':
      return 'Single Payment';
    case 'WEEKLY':
      return 'Weekly';
    case 'BIWEEKLY':
      return 'Biweekly';
    case 'MONTHLY':
      return 'Monthly';
    default:
      return frequency.charAt(0) + frequency.slice(1).toLowerCase().replace('_', ' ');
  }
};

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const { showNotification } = useNotification();

  const fetchIncomesData = async () => {
    try {
      setLoading(true);
      const data = await api.fetchIncomes();
      setIncomes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomesData();
  }, []);

  const handleCreateIncome = async (incomeData) => {
    try {
      setError(null);
      await api.createIncome(incomeData);
      await fetchIncomesData();
      setDialogOpen(false);
      showNotification('Income created successfully');
    } catch (err) {
      console.error('Error creating income:', err);
      setError(err.message || 'Failed to create income');
      showNotification('Failed to create income', 'error');
    }
  };

  const handleUpdateIncome = async (incomeData) => {
    try {
      await api.updateIncome(selectedIncome.id, incomeData);
      await fetchIncomesData();
      setDialogOpen(false);
      setSelectedIncome(null);
      showNotification('Income updated successfully');
    } catch (err) {
      setError(err.message);
      showNotification('Failed to update income', 'error');
    }
  };

  const handleDeleteIncome = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await api.deleteIncome(id);
        await fetchIncomesData();
        showNotification('Income deleted successfully');
      } catch (err) {
        setError(err.message);
        showNotification('Failed to delete income', 'error');
      }
    }
  };

  const filteredIncomes = incomes.filter(income =>
    income.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Search income..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Tooltip title="Add Income" arrow>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedIncome(null);
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
              <TableCell>Frequency</TableCell>
              <TableCell>Next Payment</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incomes.map((income) => (
              <TableRow key={income.id}>
                <TableCell>{income.name}</TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    color: 'success.main',
                    fontWeight: 'bold'
                  }}
                >
                  {formatAmount(income.amount)}
                </TableCell>
                <TableCell>{getFrequencyDisplay(income.frequency)}</TableCell>
                <TableCell>
                  {format(new Date(income.nextPayDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {income.notes && (
                    <Tooltip title={income.notes}>
                      <Typography
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'help',
                          fontStyle: 'italic',
                          color: 'text.secondary'
                        }}
                      >
                        {income.notes}
                      </Typography>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => {
                        setSelectedIncome({
                          ...income,
                          nextPayDate: format(new Date(income.nextPayDate), 'yyyy-MM-dd'),
                          startDate: format(new Date(income.startDate), 'yyyy-MM-dd'),
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDeleteIncome(income.id)}
                      color="error"
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

      <IncomeDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedIncome(null);
        }}
        onSubmit={selectedIncome ? handleUpdateIncome : handleCreateIncome}
        initialData={selectedIncome}
      />
    </Box>
  );
};

export default Income; 