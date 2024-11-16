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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import * as api from '../../utils/api';
import { useNotification } from '../../contexts/NotificationContext';

const Settings = ({ onUpdateSettings }) => {
  const { showNotification } = useNotification();
  const [settings, setSettings] = useState({
    darkMode: false,
    pushoverToken: '',
    pushoverUser: '',
    pushbulletToken: '',
    discordWebhook: '',
    notifyOnDue: true,
    notifyDaysBefore: 1,
    notifyOnPayment: true,
    emailEnabled: false,
    emailHost: '',
    emailPort: '',
    emailUser: '',
    emailPass: '',
    emailSecure: true,
    emailSummaryEnabled: false,
    emailSummaryFrequency: 'WEEKLY',
    emailBillUpdates: false,
  });
  const [showTokens, setShowTokens] = useState({
    pushover: false,
    pushbullet: false,
    discord: false,
    email: false,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailRecipients, setEmailRecipients] = useState([]);
  const [newRecipient, setNewRecipient] = useState({
    email: '',
    name: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.fetchSettings();
      setSettings(data);
      setEmailRecipients(data.emailRecipients || []);
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

  const handleAddRecipient = async () => {
    try {
      if (!newRecipient.email) {
        showNotification('Email is required', 'error');
        return;
      }

      const recipient = await api.addEmailRecipient(newRecipient);
      setEmailRecipients(prev => [...prev, recipient]);
      setNewRecipient({ email: '', name: '' });
      showNotification('Recipient added successfully', 'success');
    } catch (err) {
      showNotification('Failed to add recipient', 'error');
    }
  };

  const handleDeleteRecipient = async (id) => {
    try {
      await api.deleteEmailRecipient(id);
      setEmailRecipients(prev => prev.filter(r => r.id !== id));
      showNotification('Recipient removed successfully', 'success');
    } catch (err) {
      showNotification('Failed to remove recipient', 'error');
    }
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

        {/* Email Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 1 }} />
              Email Settings
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailEnabled}
                  onChange={handleChange}
                  name="emailEnabled"
                />
              }
              label="Enable Email Notifications"
            />

            {settings.emailEnabled && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Host"
                      name="emailHost"
                      value={settings.emailHost}
                      onChange={handleChange}
                      helperText="e.g., smtp.gmail.com"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Port"
                      name="emailPort"
                      type="number"
                      value={settings.emailPort}
                      onChange={handleChange}
                      helperText="e.g., 587"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="emailUser"
                      value={settings.emailUser}
                      onChange={handleChange}
                      type="email"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="App Password"
                      name="emailPass"
                      value={settings.emailPass}
                      onChange={handleChange}
                      type={showTokens.email ? 'text' : 'password'}
                      helperText="Use an app-specific password from your Google Account"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => toggleShowToken('email')}>
                              {showTokens.email ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailSecure}
                          onChange={handleChange}
                          name="emailSecure"
                        />
                      }
                      label="Use TLS"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Email Preferences
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailSummaryEnabled}
                          onChange={handleChange}
                          name="emailSummaryEnabled"
                        />
                      }
                      label="Receive Summary Reports"
                    />

                    {settings.emailSummaryEnabled && (
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Summary Frequency</InputLabel>
                        <Select
                          value={settings.emailSummaryFrequency}
                          onChange={handleChange}
                          name="emailSummaryFrequency"
                          label="Summary Frequency"
                        >
                          <MenuItem value="DAILY">Daily</MenuItem>
                          <MenuItem value="WEEKLY">Weekly</MenuItem>
                          <MenuItem value="MONTHLY">Monthly</MenuItem>
                        </Select>
                      </FormControl>
                    )}

                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailBillUpdates}
                          onChange={handleChange}
                          name="emailBillUpdates"
                        />
                      }
                      label="Receive Bill Payment Updates"
                      sx={{ mt: 2, display: 'block' }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Email Recipients
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email Address"
                            value={newRecipient.email}
                            onChange={(e) => setNewRecipient(prev => ({
                              ...prev,
                              email: e.target.value
                            }))}
                            type="email"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Name (Optional)"
                            value={newRecipient.name}
                            onChange={(e) => setNewRecipient(prev => ({
                              ...prev,
                              name: e.target.value
                            }))}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={handleAddRecipient}
                            disabled={!newRecipient.email}
                          >
                            Add Recipient
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>

                    <List>
                      {emailRecipients.map((recipient) => (
                        <ListItem
                          key={recipient.id}
                          sx={{
                            bgcolor: 'background.paper',
                            mb: 1,
                            borderRadius: 1,
                          }}
                        >
                          <ListItemText
                            primary={recipient.email}
                            secondary={recipient.name}
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDeleteRecipient(recipient.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        try {
                          await api.testEmailSettings(settings);
                          showNotification('Test email sent successfully!', 'success');
                        } catch (err) {
                          showNotification('Failed to send test email', 'error');
                        }
                      }}
                      sx={{ mt: 2 }}
                    >
                      Send Test Email
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
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