import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { useState } from 'react';
import { format } from 'date-fns';

const BillPaymentDialog = ({ open, bill, onClose, onSubmit }) => {
  const [paymentDate, setPaymentDate] = useState(new Date());

  const handleSubmit = () => {
    onSubmit(format(paymentDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Mark Bill as Paid</DialogTitle>
      <DialogContent>
        <DatePicker
          label="Payment Date"
          value={paymentDate}
          onChange={(newDate) => setPaymentDate(newDate)}
          renderInput={(params) => <TextField {...params} fullWidth sx={{ mt: 2 }} />}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Confirm Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillPaymentDialog; 