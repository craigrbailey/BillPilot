import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  IconButton,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon } from '@mui/icons-material';
import * as api from '../../utils/api';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

const BillDialog = ({ open, onClose, onSubmit, initialData }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      amount: '',
      dueDate: new Date(),
      categoryId: '',
      balance: '',
      isPaid: false,
    }
  );
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchCategories();
      if (initialData) {
        setFormData({
          ...initialData,
          dueDate: new Date(initialData.dueDate),
          categoryId: initialData.category.id,
        });
        setAmountInput(initialData.amount.toString());
      } else {
        setFormData({
          name: '',
          amount: '',
          dueDate: new Date(),
          categoryId: '',
          balance: '',
          isPaid: false,
        });
        setAmountInput('');
      }
    }
  }, [open, initialData]);

  const fetchCategories = async () => {
    try {
      const data = await api.fetchCategories();
      setCategories(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError(error.message || 'Failed to load categories');
      setCategories([]);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const data = await api.createCategory({ name: newCategory.trim() });
      setCategories(prev => [...prev, data]);
      setNewCategory('');
      setError(null);
    } catch (error) {
      console.error('Failed to create category:', error);
      setError(error.message || 'Failed to create category');
    }
  };

  const formatAmount = (input) => {
    const digits = input.replace(/\D/g, '');
    const cents = parseInt(digits, 10);
    if (isNaN(cents)) return '';
    const dollars = (cents / 100).toFixed(2);
    return dollars;
  };

  const handleAmountChange = (e) => {
    const input = e.target.value;
    setAmountInput(input);
    const formattedAmount = formatAmount(input);
    setFormData(prev => ({
      ...prev,
      amount: formattedAmount,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Format the data before submission
      const submissionData = {
        name: formData.name,
        amount: parseFloat(formData.amount || amountInput),
        dueDate: formData.dueDate.toISOString(),
        categoryId: parseInt(formData.categoryId),
        balance: formData.balance ? parseFloat(formData.balance) : null,
        isPaid: Boolean(formData.isPaid),
      };

      // Validate required fields
      if (!submissionData.name || !submissionData.amount || !submissionData.categoryId) {
        throw new Error('Please fill in all required fields');
      }

      onSubmit(submissionData);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? 'Edit Bill' : 'Create New Bill'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="name"
              label="Bill Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="amount"
              label="Amount"
              value={amountInput}
              onChange={handleAmountChange}
              required
              fullWidth
              placeholder="0.00"
              helperText="Amount will be formatted automatically (e.g., 94111 → 941.11)"
            />
            <DatePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={(newValue) =>
                setFormData((prev) => ({ ...prev, dueDate: newValue }))
              }
              renderInput={(params) => (
                <TextField {...params} fullWidth required />
              )}
            />
            
            {/* Categories Section */}
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  label="New Category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  size="small"
                  fullWidth
                />
                <IconButton 
                  onClick={handleCreateCategory}
                  color="primary"
                  disabled={!newCategory.trim()}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Array.isArray(categories) && categories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    onClick={() => setFormData(prev => ({ ...prev, categoryId: category.id }))}
                    sx={{ 
                      backgroundColor: formData.categoryId === category.id ? category.color : 'transparent',
                      color: formData.categoryId === category.id ? 
                        theme.palette.getContrastText(category.color) : 
                        'inherit',
                      borderColor: category.color,
                      '&:hover': {
                        backgroundColor: alpha(category.color, 0.1),
                      },
                    }}
                    variant={formData.categoryId === category.id ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Box>

            <TextField
              name="balance"
              label="Balance (Optional)"
              type="number"
              value={formData.balance}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={!formData.name || !formData.amount || !formData.categoryId}
          >
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BillDialog; 