import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon } from '@mui/icons-material';
import * as api from '../../utils/api';

// Function to generate random color
const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const BillDialog = ({ open, onClose, onSubmit, initialData, payees, categories }) => {
  const [formData, setFormData] = useState({
    amount: '',
    dueDate: new Date(),
    payeeId: '',
    categoryId: '',
    description: '',
    isOneTime: false,
    payeeName: '',
    isPaid: false,
    paidDate: null,
  });
  const [newCategory, setNewCategory] = useState('');
  const [localCategories, setLocalCategories] = useState(categories || []);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount ? String(initialData.amount) : '',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate) : new Date(),
        payeeId: initialData.payeeId || '',
        categoryId: initialData.categoryId || '',
        description: initialData.description || '',
        isOneTime: initialData.isOneTime || false,
        payeeName: initialData.payeeName || '',
        isPaid: initialData.isPaid || false,
        paidDate: initialData.paidDate ? new Date(initialData.paidDate) : null,
      });
    } else {
      setFormData({
        amount: '',
        dueDate: new Date(),
        payeeId: '',
        categoryId: '',
        description: '',
        isOneTime: false,
        payeeName: '',
        isPaid: false,
        paidDate: null,
      });
    }
  }, [initialData, open]);

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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePayeeChange = (e) => {
    const selectedPayee = payees.find(p => p.id === e.target.value);
    setFormData(prev => ({
      ...prev,
      payeeId: e.target.value,
      // Auto-fill category and amount from payee if it's a new bill
      ...((!initialData && selectedPayee) ? {
        categoryId: selectedPayee.categoryId,
        amount: String(selectedPayee.expectedAmount),
      } : {}),
    }));
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const categoryData = {
        name: newCategory.trim(),
        color: generateRandomColor(),
      };
      const createdCategory = await api.createCategory(categoryData);
      setLocalCategories(prev => [...prev, createdCategory]);
      setFormData(prev => ({ ...prev, categoryId: createdCategory.id }));
      setNewCategory('');
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount || '0'),
      categoryId: parseInt(formData.categoryId),
      payeeId: formData.isOneTime ? null : (formData.payeeId ? parseInt(formData.payeeId) : null),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Bill' : 'Add Bill'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isOneTime}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      isOneTime: e.target.checked,
                      payeeId: e.target.checked ? '' : prev.payeeId,
                      payeeName: e.target.checked ? '' : prev.payeeName,
                    }));
                  }}
                  name="isOneTime"
                />
              }
              label="One-time Bill"
              sx={{ mb: 1 }}
            />

            {!formData.isOneTime ? (
              <FormControl fullWidth>
                <InputLabel>Payee</InputLabel>
                <Select
                  name="payeeId"
                  value={formData.payeeId}
                  onChange={handlePayeeChange}
                  label="Payee"
                >
                  {payees.map(payee => (
                    <MenuItem key={payee.id} value={payee.id}>
                      {payee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                name="payeeName"
                label="Payee Name"
                value={formData.payeeName}
                onChange={handleChange}
                fullWidth
                required
              />
            )}

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

            {/* Category Selection with Add New Category Option */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label="Category"
                >
                  {localCategories.map(category => (
                    <MenuItem 
                      key={category.id} 
                      value={category.id}
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                        }}
                      />
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  placeholder="New Category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  sx={{ width: 150 }}
                />
                <IconButton
                  onClick={handleCreateCategory}
                  disabled={!newCategory.trim()}
                  color="primary"
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>

            <DatePicker
              label="Due Date"
              value={formData.dueDate}
              onChange={(newDate) => setFormData(prev => ({ ...prev, dueDate: newDate }))}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />

            {formData.isPaid && (
              <DatePicker
                label="Paid Date"
                value={formData.paidDate}
                onChange={(newDate) => setFormData(prev => ({ ...prev, paidDate: newDate }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPaid}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      isPaid: e.target.checked,
                      paidDate: e.target.checked ? new Date() : null,
                    }));
                  }}
                />
              }
              label="Bill is Paid"
            />

            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!formData.amount || !formData.categoryId || (formData.isOneTime ? !formData.payeeName : !formData.payeeId)}
          >
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BillDialog; 