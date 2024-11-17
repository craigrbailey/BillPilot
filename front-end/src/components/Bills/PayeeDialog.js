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

const PayeeDialog = ({ open, onClose, onSubmit, initialData, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    expectedAmount: '',
    frequency: 'MONTHLY',
    startDate: new Date(),
    categoryId: '',
    description: '',
  });
  const [newCategory, setNewCategory] = useState('');
  const [localCategories, setLocalCategories] = useState(categories || []);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        expectedAmount: initialData.expectedAmount ? String(initialData.expectedAmount) : '',
        frequency: initialData.frequency || 'MONTHLY',
        startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
        categoryId: initialData.categoryId || '',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        expectedAmount: '',
        frequency: 'MONTHLY',
        startDate: new Date(),
        categoryId: '',
        description: '',
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
      expectedAmount: formattedAmount,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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
      expectedAmount: parseFloat(formData.expectedAmount || '0'),
      categoryId: parseInt(formData.categoryId),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Payee' : 'Add Payee'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="name"
              label="Payee Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              name="expectedAmount"
              label="Expected Amount"
              value={formData.expectedAmount}
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

            <FormControl fullWidth required>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                label="Frequency"
              >
                <MenuItem value="WEEKLY">Weekly</MenuItem>
                <MenuItem value="BIWEEKLY">Bi-weekly</MenuItem>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                <MenuItem value="BIANNUAL">Every 6 Months</MenuItem>
                <MenuItem value="ANNUAL">Annual</MenuItem>
              </Select>
            </FormControl>

            <DatePicker
              label="Start Date"
              value={formData.startDate}
              onChange={(newDate) => setFormData(prev => ({ ...prev, startDate: newDate }))}
              renderInput={(params) => <TextField {...params} fullWidth required />}
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
            disabled={!formData.name || !formData.expectedAmount || !formData.categoryId}
          >
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PayeeDialog; 