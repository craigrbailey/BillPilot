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
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const IncomeEntryDialog = ({ open, onClose, onSubmit, initialData, incomeSources }) => {
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date(),
    sourceId: '',
    description: '',
    isOneTime: false,
    sourceName: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount ? String(initialData.amount) : '',
        date: initialData.date ? new Date(initialData.date) : new Date(),
        sourceId: initialData.sourceId || '',
        description: initialData.description || '',
        isOneTime: initialData.isOneTime || false,
        sourceName: initialData.sourceName || '',
      });
    } else {
      setFormData({
        amount: '',
        date: new Date(),
        sourceId: '',
        description: '',
        isOneTime: false,
        sourceName: '',
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
      <DialogTitle>{initialData ? 'Edit Income Entry' : 'Add Income Entry'}</DialogTitle>
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
                      sourceId: e.target.checked ? '' : prev.sourceId,
                    }));
                  }}
                  name="isOneTime"
                />
              }
              label="One-time Income"
              sx={{ mb: 1 }}
            />

            {!formData.isOneTime ? (
              <FormControl fullWidth>
                <InputLabel>Income Source</InputLabel>
                <Select
                  name="sourceId"
                  value={formData.sourceId}
                  onChange={handleChange}
                  label="Income Source"
                >
                  {incomeSources.map(source => (
                    <MenuItem key={source.id} value={source.id}>
                      {source.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                name="sourceName"
                label="Source Name"
                value={formData.sourceName}
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

            <DatePicker
              label="Date"
              value={formData.date}
              onChange={(newDate) => setFormData(prev => ({ ...prev, date: newDate }))}
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
            disabled={!formData.amount || (formData.isOneTime ? !formData.sourceName : !formData.sourceId)}
          >
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default IncomeEntryDialog; 