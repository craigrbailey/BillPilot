import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import * as api from '../../utils/api';

const Settings = ({ darkMode, onUpdateSettings }) => {
  const handleDarkModeChange = async (event) => {
    try {
      const updatedSettings = await api.updateSettings({
        darkMode: event.target.checked,
      });
      onUpdateSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Settings
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode || false}
              onChange={handleDarkModeChange}
            />
          }
          label="Dark Mode"
        />
      </Paper>
    </Box>
  );
};

export default Settings; 