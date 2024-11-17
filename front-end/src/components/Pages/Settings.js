import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  TextField,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import * as api from '../../utils/api';
import NotificationSettings from '../Settings/NotificationSettings';
import ThemeToggle from '../Settings/ThemeToggle';
import {
  fetchSettings,
  updateSettings,
  resetDatabase,
  testEmailSettings,
  addEmailRecipient,
  deleteEmailRecipient
} from '../../utils/api/settingsAPI';
import {
  fetchNotificationSettings,
  updateNotificationProvider,
  updateNotificationType,
  testNotificationProvider
} from '../../utils/api/notificationAPI';

const Settings = () => {
  const [resetDialog, setResetDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetRequest = () => {
    setResetDialog(true);
  };

  const handleResetConfirm = () => {
    setResetDialog(false);
    setConfirmDialog(true);
  };

  const handleResetDatabase = async () => {
    if (confirmText.toLowerCase() !== 'confirm') {
      setResetError('Please type "confirm" to proceed');
      return;
    }

    try {
      await api.resetDatabase();
      setResetSuccess(true);
      setConfirmDialog(false);
      setConfirmText('');
      setResetError(null);
      // Optionally refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setResetError('Failed to reset database. Please try again.');
      console.error('Reset database error:', error);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {resetSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Database reset successfully. The page will refresh momentarily.
        </Alert>
      )}

      {/* Theme Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Theme
        </Typography>
        <ThemeToggle />
      </Paper>

      {/* Notification Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        <NotificationSettings />
      </Paper>

      {/* Database Reset Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          <span>Danger Zone</span>
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Reset Database
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This will permanently delete all your payees, bills, incomes, and sources. This action cannot be undone.
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            color="error"
            onClick={handleResetRequest}
          >
            Reset Database
          </Button>
        </Box>
      </Paper>

      {/* Initial Confirmation Dialog */}
      <Dialog 
        open={resetDialog} 
        onClose={() => setResetDialog(false)}
      >
        <DialogTitle color="error">
          ⚠️ Warning: Database Reset
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to reset the database? This will delete:
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>All payees</li>
            <li>All bills</li>
            <li>All income sources</li>
            <li>All income entries</li>
          </Box>
          <Typography variant="body1" color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleResetConfirm}
          >
            Yes, I want to reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Final Confirmation Dialog */}
      <Dialog 
        open={confirmDialog} 
        onClose={() => {
          setConfirmDialog(false);
          setConfirmText('');
          setResetError(null);
        }}
      >
        <DialogTitle color="error">
          ⚠️ Final Confirmation Required
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            To confirm that you want to permanently delete all data, please type "confirm" below:
          </Typography>
          <TextField
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            error={!!resetError}
            helperText={resetError}
            sx={{ mt: 2 }}
            placeholder="Type 'confirm' here"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setConfirmDialog(false);
              setConfirmText('');
              setResetError(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleResetDatabase}
          >
            Reset Database
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 