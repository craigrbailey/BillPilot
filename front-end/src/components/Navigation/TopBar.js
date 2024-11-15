import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Switch,
} from '@mui/material';
import {
  Menu as MenuIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';

const TopBar = ({ handleDrawerToggle, darkMode, onUpdateSettings }) => {
  const handleDarkModeChange = async (e) => {
    try {
      await onUpdateSettings({ darkMode: e.target.checked });
    } catch (error) {
      console.error('Failed to update dark mode:', error);
    }
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Bill Tracker
        </Typography>
        <DarkModeIcon sx={{ mr: 1 }} />
        <Switch
          checked={darkMode || false}
          onChange={handleDarkModeChange}
          color="default"
        />
      </Toolbar>
    </AppBar>
  );
};

export default TopBar; 