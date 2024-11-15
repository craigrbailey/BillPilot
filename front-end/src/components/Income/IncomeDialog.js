import { useState } from 'react';
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
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const IncomeDialog = ({ open, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      amount: '',
      frequency: 'ONE_TIME',
      dayOfWeek: null,
      dayOfMonth: null,
      startDate: new Date(),
      isRecurring: false,
    }
  );
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        dayOfWeek: formData.frequency === 'WEEKLY' ? parseInt(formData.dayOfWeek) : null,
        dayOfMonth: formData.frequency === 'MONTHLY' ? parseInt(formData.dayOfMonth) : null,
      };

      if (!submissionData.name || !submissionData.amount) {
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
          {initialData ? 'Edit Income' : 'Add New Income'}
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
              label="Income Name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="amount"
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="frequency"
                value={formData.frequency}
                onChange={(e) => {
                  const newFrequency = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    frequency: newFrequency,
                    isRecurring: newFrequency !== 'ONE_TIME',
                    dayOfWeek: null,
                    dayOfMonth: null,
                  }));
                }}
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
              </>
            )}

            <DatePicker
              label="Start Date"
              value={formData.startDate}
              onChange={(newValue) =>
                setFormData(prev => ({ ...prev, startDate: newValue }))
              }
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />

            {formData.frequency !== 'ONE_TIME' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isRecurring}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        isRecurring: e.target.checked,
                      }))
                    }
                    name="isRecurring"
                  />
                }
                label="Recurring Income"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default IncomeDialog; 