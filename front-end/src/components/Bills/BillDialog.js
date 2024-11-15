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
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon } from '@mui/icons-material';
import * as api from '../../utils/api';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const BillDialog = ({ open, onClose, onSubmit, initialData }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: new Date(),
    categoryId: '',
    balance: '',
    isPaid: false,
    isRecurring: false,
    frequency: 'ONE_TIME',
    dayOfWeek: null,
    dayOfMonth: null,
    notes: '',
  });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchCategories();
      if (initialData) {
        const amount = initialData?.amount !== undefined && initialData?.amount !== null
          ? String(initialData.amount)
          : '';
        
        let dayOfMonth = null;
        if (initialData.frequency === 'MONTHLY') {
          dayOfMonth = initialData.dayOfMonth || new Date(initialData.dueDate).getDate();
        }

        let dayOfWeek = null;
        if (initialData.frequency === 'WEEKLY') {
          dayOfWeek = initialData.dayOfWeek || new Date(initialData.dueDate).getDay();
        }

        setFormData({
          name: initialData.name || '',
          amount: amount,
          dueDate: new Date(initialData.dueDate),
          categoryId: initialData.category?.id || '',
          balance: initialData.balance || '',
          isPaid: Boolean(initialData.isPaid),
          isRecurring: Boolean(initialData.isRecurring),
          frequency: initialData.frequency || 'ONE_TIME',
          dayOfWeek: dayOfWeek,
          dayOfMonth: dayOfMonth ? String(dayOfMonth) : '',
          notes: initialData.notes || '',
        });
        setAmountInput(amount);
      } else {
        setFormData({
          name: '',
          amount: '',
          dueDate: new Date(),
          categoryId: '',
          balance: '',
          isPaid: false,
          isRecurring: false,
          frequency: 'ONE_TIME',
          dayOfWeek: null,
          dayOfMonth: '',
          notes: '',
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

  const formatAmountInput = (input) => {
    const numericValue = input.replace(/[^0-9]/g, '');
    
    if (numericValue === '') return '';
    
    const cents = parseInt(numericValue, 10);
    
    return (cents / 100).toFixed(2);
  };

  const handleAmountChange = (e) => {
    const rawInput = e.target.value;
    const formattedAmount = formatAmountInput(rawInput);
    
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
        amount: parseFloat(formData.amount || '0'),
        dueDate: new Date(formData.dueDate).toISOString(),
        categoryId: parseInt(formData.categoryId),
        balance: formData.balance ? parseFloat(formData.balance) : null,
        isPaid: Boolean(formData.isPaid),
        isRecurring: Boolean(formData.isRecurring),
        frequency: formData.frequency,
        dayOfWeek: formData.dayOfWeek ? parseInt(formData.dayOfWeek) : null,
        dayOfMonth: formData.dayOfMonth ? parseInt(formData.dayOfMonth) : null,
        notes: formData.notes,
        parentId: formData.parentId || null,
      };

      // Validate required fields
      if (!submissionData.name || isNaN(submissionData.amount) || !submissionData.categoryId) {
        throw new Error('Please fill in all required fields');
      }

      // If recurring, ensure frequency is set and validate dayOfMonth
      if (submissionData.isRecurring) {
        if (submissionData.frequency === 'ONE_TIME') {
          throw new Error('Please select a frequency for recurring bills');
        }
        if (submissionData.frequency === 'MONTHLY' && !submissionData.dayOfMonth) {
          throw new Error('Please select a day of the month for monthly bills');
        }
      }

      onSubmit(submissionData);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleFrequencyChange = (e) => {
    const newFrequency = e.target.value;
    setFormData(prev => {
      const newData = {
        ...prev,
        frequency: newFrequency,
        isRecurring: newFrequency !== 'ONE_TIME',
      };

      if (newFrequency === 'WEEKLY') {
        newData.dayOfWeek = new Date(prev.dueDate).getDay();
        newData.dayOfMonth = null;
      }
      else if (newFrequency === 'MONTHLY') {
        newData.dayOfMonth = new Date(prev.dueDate).getDate().toString();
        newData.dayOfWeek = null;
      }
      else {
        newData.dayOfWeek = null;
        newData.dayOfMonth = null;
      }

      return newData;
    });
  };

  const handleDueDateChange = (newDate) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        dueDate: newDate
      };

      if (prev.frequency === 'MONTHLY') {
        updatedData.dayOfMonth = newDate.getDate().toString();
      }
      else if (prev.frequency === 'WEEKLY') {
        updatedData.dayOfWeek = newDate.getDay();
      }

      return updatedData;
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Bill' : 'Add Bill'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
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
              value={formData.amount}
              onChange={handleAmountChange}
              required
              fullWidth
              placeholder="0.00"
              inputProps={{
                inputMode: 'numeric',
              }}
              helperText="Amount will be formatted automatically (e.g., 1234 → 12.34)"
            />

            <DatePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={handleDueDateChange}
              renderInput={(params) => <TextField {...params} fullWidth required />}
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

            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="frequency"
                value={formData.frequency}
                onChange={handleFrequencyChange}
                label="Frequency"
              >
                <MenuItem value="ONE_TIME">One Time</MenuItem>
                <MenuItem value="WEEKLY">Weekly</MenuItem>
                <MenuItem value="BIWEEKLY">Bi-weekly</MenuItem>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
              </Select>
            </FormControl>

            {formData.frequency !== 'ONE_TIME' && (
              <>
                {formData.frequency === 'WEEKLY' && (
                  <FormControl fullWidth>
                    <InputLabel>Day of Week</InputLabel>
                    <Select
                      name="dayOfWeek"
                      value={formData.dayOfWeek || ''}
                      onChange={handleChange}
                      label="Day of Week"
                      required
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <MenuItem key={day.value} value={day.value}>
                          {day.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {formData.frequency === 'MONTHLY' && (
                  <TextField
                    name="dayOfMonth"
                    label="Day of Month (1-31)"
                    type="number"
                    value={formData.dayOfMonth || ''}
                    onChange={handleChange}
                    required
                    fullWidth
                    inputProps={{ min: 1, max: 31 }}
                  />
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isRecurring}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          isRecurring: e.target.checked,
                          frequency: e.target.checked ? (prev.frequency === 'ONE_TIME' ? 'MONTHLY' : prev.frequency) : 'ONE_TIME',
                        }))
                      }
                      name="isRecurring"
                    />
                  }
                  label="Recurring Bill"
                />
              </>
            )}

            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={4}
              placeholder="Add any notes about this bill..."
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