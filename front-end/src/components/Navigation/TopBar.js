import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ handleDrawerToggle, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Bills', icon: <ReceiptIcon />, path: '/bills' },
    { text: 'Income', icon: <AttachMoneyIcon />, path: '/income' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/payments' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - 240px)` },
        ml: { sm: `240px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Bills App
        </Typography>
        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {menuItems.map((item) => (
              <MenuItem
                key={item.text}
                onClick={() => handleNavigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText>{item.text}</ListItemText>
              </MenuItem>
            ))}
            <MenuItem onClick={onLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar; 