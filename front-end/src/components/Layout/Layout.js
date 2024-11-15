import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from '../Navigation/Sidebar';
import TopBar from '../Navigation/TopBar';
import Bills from '../Pages/Bills';
import Settings from '../Pages/Settings';
import Income from '../Pages/Income';
import Dashboard from '../Pages/Dashboard';
import Categories from '../Pages/Categories';

const Layout = ({ user, onLogout, onUpdateSettings }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {isMobile ? (
        <TopBar 
          handleDrawerToggle={handleDrawerToggle}
          darkMode={user?.settings?.darkMode}
          onUpdateSettings={onUpdateSettings}
          onLogout={onLogout}
        />
      ) : (
        <Sidebar 
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          darkMode={user?.settings?.darkMode}
          onUpdateSettings={onUpdateSettings}
          onLogout={onLogout}
        />
      )}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          mt: isMobile ? 8 : 0
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/income" element={<Income />} />
          <Route path="/categories" element={<Categories />} />
          <Route 
            path="/settings" 
            element={
              <Settings 
                darkMode={user?.settings?.darkMode}
                onUpdateSettings={onUpdateSettings}
              />
            } 
          />
        </Routes>
      </Box>
    </Box>
  );
};

export default Layout; 