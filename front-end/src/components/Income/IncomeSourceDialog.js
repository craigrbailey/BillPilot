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
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const IncomeSourceDialog = ({ open, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'BIWEEKLY',
    startDate: new Date(),
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        amount: initialData.amount ? String(initialData.amount) : '',
        frequency: initialData.frequency || 'BIWEEKLY',
        startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        frequency: 'BIWEEKLY',
        startDate: new Date(),
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount || '0'),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Income Source' : 'Add Income Source'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              name="name"
              label="Source Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              name="amount"
              label="Expected Amount"
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

            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                label="Frequency"
                required
              >
                <MenuItem value="WEEKLY">Weekly</MenuItem>
                <MenuItem value="BIWEEKLY">Bi-weekly</MenuItem>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="QUARTERLY">Quarterly</MenuItem>
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
            disabled={!formData.name || !formData.amount}
          >
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default IncomeSourceDialog; 