import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Grid,
  Divider,
  Alert,
  IconButton,
  Collapse,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import * as api from '../../utils/api';
import { NOTIFICATION_TYPES, PROVIDERS } from '../../constants/notificationTypes';

const ProviderSettings = ({ provider, settings, onUpdate, onTest }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    setLoading(true);
    try {
      await onTest(provider);
      setTestResult({ success: true, message: 'Test notification sent successfully!' });
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">
            {PROVIDERS[provider].icon} {PROVIDERS[provider].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {PROVIDERS[provider].description}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.isEnabled}
                onChange={(e) => onUpdate(provider, { isEnabled: e.target.checked })}
              />
            }
            label={settings.isEnabled ? 'Enabled' : 'Disabled'}
          />
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {PROVIDERS[provider].fields.map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                <TextField
                  fullWidth
                  label={field.label}
                  type={field.type}
                  value={settings[field.name] || ''}
                  onChange={(e) => onUpdate(provider, { [field.name]: e.target.value })}
                  helperText={field.helperText}
                />
              </Grid>
            ))}
          </Grid>

          {settings.isEnabled && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleTest}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
              >
                Test {PROVIDERS[provider].name}
              </Button>
              {testResult && (
                <Alert 
                  severity={testResult.success ? 'success' : 'error'}
                  onClose={() => setTestResult(null)}
                >
                  {testResult.message}
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

const NotificationTypeSettings = ({ type, settings, providers, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);

  const handleSettingChange = (setting, value) => {
    onUpdate(type, { ...settings, [setting]: value });
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">
            {NOTIFICATION_TYPES[type].icon} {NOTIFICATION_TYPES[type].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {NOTIFICATION_TYPES[type].description}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.isEnabled}
                onChange={(e) => onUpdate(type, { ...settings, isEnabled: e.target.checked })}
              />
            }
            label={settings.isEnabled ? 'Enabled' : 'Disabled'}
          />
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {NOTIFICATION_TYPES[type].settings.map((setting) => (
              <Grid item xs={12} sm={6} key={setting.name}>
                {setting.type === 'time' ? (
                  <TimePicker
                    label={setting.label}
                    value={settings[setting.name] ? new Date(settings[setting.name]) : null}
                    onChange={(newTime) => handleSettingChange(setting.name, newTime)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                ) : setting.type === 'select' ? (
                  <FormControl fullWidth>
                    <InputLabel>{setting.label}</InputLabel>
                    <Select
                      value={settings[setting.name] || ''}
                      onChange={(e) => handleSettingChange(setting.name, e.target.value)}
                      label={setting.label}
                    >
                      {setting.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    label={setting.label}
                    type={setting.type}
                    value={settings[setting.name] || ''}
                    onChange={(e) => handleSettingChange(setting.name, e.target.value)}
                    InputProps={setting.type === 'number' ? {
                      inputProps: { min: setting.min, max: setting.max }
                    } : undefined}
                  />
                )}
              </Grid>
            ))}
          </Grid>

          {settings.isEnabled && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Enable Providers for {NOTIFICATION_TYPES[type].name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(providers)
                  .filter(([_, providerSettings]) => providerSettings.isEnabled)
                  .map(([provider, _]) => (
                    <FormControlLabel
                      key={provider}
                      control={
                        <Switch
                          checked={settings.providers?.includes(provider) || false}
                          onChange={(e) => {
                            const updatedProviders = e.target.checked
                              ? [...(settings.providers || []), provider]
                              : (settings.providers || []).filter(p => p !== provider);
                            onUpdate(type, { ...settings, providers: updatedProviders });
                          }}
                        />
                      }
                      label={PROVIDERS[provider].name}
                    />
                  ))}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    providers: {},
    types: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.fetchNotificationSettings();
      setSettings(data);
    } catch (err) {
      setError('Failed to load notification settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderUpdate = async (provider, updates) => {
    try {
      await api.updateNotificationProvider(provider, updates);
      fetchSettings();
    } catch (error) {
      setError('Failed to update provider settings');
      console.error(error);
    }
  };

  const handleTypeUpdate = async (type, updates) => {
    try {
      await api.updateNotificationType(type, updates);
      fetchSettings();
    } catch (error) {
      setError('Failed to update notification type settings');
      console.error(error);
    }
  };

  const handleProviderTest = async (provider) => {
    await api.testNotificationProvider(provider);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h5" gutterBottom>
        Notification Providers
      </Typography>
      {Object.keys(PROVIDERS).map((providerType) => (
        <ProviderSettings
          key={providerType}
          provider={providerType}
          settings={settings.providers[providerType] || { isEnabled: false }}
          onUpdate={handleProviderUpdate}
          onTest={handleProviderTest}
        />
      ))}

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Notification Types
      </Typography>
      {Object.keys(NOTIFICATION_TYPES).map((type) => (
        <NotificationTypeSettings
          key={type}
          type={type}
          settings={settings.types[type] || { isEnabled: false }}
          providers={settings.providers}
          onUpdate={handleTypeUpdate}
        />
      ))}
    </Box>
  );
};

export default NotificationSettings; 