import { FormControlLabel, Switch } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <FormControlLabel
      control={
        <Switch
          checked={darkMode}
          onChange={toggleDarkMode}
          name="darkMode"
        />
      }
      label={darkMode ? "Dark Mode" : "Light Mode"}
    />
  );
};

export default ThemeToggle; 