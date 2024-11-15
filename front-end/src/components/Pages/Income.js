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
  CheckCircle as PaidIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import * as api from '../../utils/api';
import IncomeDialog from '../Income/IncomeDialog';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);

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
    } catch (err) {
      console.error('Error creating income:', err);
      setError(err.message || 'Failed to create income');
    }
  };

  const handleUpdateIncome = async (incomeData) => {
    try {
      await api.updateIncome(selectedIncome.id, incomeData);
      await fetchIncomesData();
      setDialogOpen(false);
      setSelectedIncome(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteIncome = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await api.deleteIncome(id);
        await fetchIncomesData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.markIncomePaid(id);
      await fetchIncomesData();
    } catch (err) {
      setError(err.message);
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
          placeholder="Search incomes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedIncome(null);
            setDialogOpen(true);
          }}
        >
          Add Income
        </Button>
      </Box>

      <Paper>
        <List>
          {filteredIncomes.map((income) => (
            <ListItem key={income.id} divider>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {income.name}
                    <Chip
                      label={income.frequency}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {income.isRecurring && (
                      <Chip label="Recurring" size="small" color="info" />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    Amount: ${parseFloat(income.amount).toFixed(2)}
                    <br />
                    Next Payment: {format(new Date(income.nextPayDate), 'MMM dd, yyyy')}
                    {income.lastPaid && (
                      <>
                        <br />
                        Last Paid: {format(new Date(income.lastPaid), 'MMM dd, yyyy')}
                      </>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleMarkPaid(income.id)}
                  title="Mark as Paid"
                >
                  <PaidIcon color="success" />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => {
                    setSelectedIncome(income);
                    setDialogOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteIncome(income.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {filteredIncomes.length === 0 && (
            <ListItem>
              <ListItemText
                primary={
                  <Typography align="center">
                    No incomes found
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
      </Paper>

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