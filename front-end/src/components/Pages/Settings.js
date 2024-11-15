import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import * as api from '../../utils/api';

const Settings = ({ onUpdateSettings }) => {
  const [settings, setSettings] = useState({
    darkMode: false,
    pushoverToken: '',
    pushoverUser: '',
    pushbulletToken: '',
    discordWebhook: '',
    notifyOnDue: true,
    notifyDaysBefore: 1,
    notifyOnPayment: true,
  });
  const [showTokens, setShowTokens] = useState({
    pushover: false,
    pushbullet: false,
    discord: false,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.fetchSettings();
      setSettings(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load settings');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = e.target.type === 'checkbox' ? checked : value;
    
    setSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSave = async () => {
    try {
      await api.updateSettings(settings);
      onUpdateSettings(settings);
      setSuccess('Settings saved successfully');
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings');
      setSuccess(null);
    }
  };

  const toggleShowToken = (service) => {
    setShowTokens(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Theme Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {settings.darkMode ? <DarkModeIcon sx={{ mr: 1 }} /> : <LightModeIcon sx={{ mr: 1 }} />}
              Theme Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={handleChange}
                  name="darkMode"
                />
              }
              label="Dark Mode"
            />
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ mr: 1 }} />
              Notification Settings
            </Typography>

            {/* General Notification Preferences */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Preferences
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifyOnDue}
                    onChange={handleChange}
                    name="notifyOnDue"
                  />
                }
                label="Notify when bills are due"
              />
              <Box sx={{ ml: 3, mt: 1 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Notify days before</InputLabel>
                  <Select
                    value={settings.notifyDaysBefore}
                    onChange={handleChange}
                    name="notifyDaysBefore"
                    disabled={!settings.notifyOnDue}
                  >
                    <MenuItem value={1}>1 day before</MenuItem>
                    <MenuItem value={2}>2 days before</MenuItem>
                    <MenuItem value={3}>3 days before</MenuItem>
                    <MenuItem value={7}>1 week before</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifyOnPayment}
                    onChange={handleChange}
                    name="notifyOnPayment"
                  />
                }
                label="Notify when payments are made"
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Pushover Settings */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Pushover Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pushover User Key"
                    name="pushoverUser"
                    value={settings.pushoverUser}
                    onChange={handleChange}
                    type={showTokens.pushover ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => toggleShowToken('pushover')}>
                            {showTokens.pushover ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pushover API Token"
                    name="pushoverToken"
                    value={settings.pushoverToken}
                    onChange={handleChange}
                    type={showTokens.pushover ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => toggleShowToken('pushover')}>
                            {showTokens.pushover ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Pushbullet Settings */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Pushbullet Settings
              </Typography>
              <TextField
                fullWidth
                label="Pushbullet Access Token"
                name="pushbulletToken"
                value={settings.pushbulletToken}
                onChange={handleChange}
                type={showTokens.pushbullet ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => toggleShowToken('pushbullet')}>
                        {showTokens.pushbullet ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Discord Settings */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Discord Settings
              </Typography>
              <TextField
                fullWidth
                label="Discord Webhook URL"
                name="discordWebhook"
                value={settings.discordWebhook}
                onChange={handleChange}
                type={showTokens.discord ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => toggleShowToken('discord')}>
                        {showTokens.discord ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          size="large"
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings; 