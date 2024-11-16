import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const BillUnpayDialog = ({ open, bill, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Unmark Bill as Paid</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to mark this bill as unpaid? This will remove the payment record.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Confirm Unpay
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillUnpayDialog; 