import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import * as api from './utils/api';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkRecurring = async () => {
      if (user) {
        try {
          await api.checkRecurringItems();
        } catch (error) {
          console.error('Error checking recurring items:', error);
        }
      }
    };

    checkRecurring();
  }, [user]);

  const theme = createTheme({
    palette: {
      mode: user?.settings?.darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  user ? (
                    <Navigate to="/bills" replace />
                  ) : (
                    <Login onLogin={handleLogin} />
                  )
                }
              />
              <Route
                path="/*"
                element={
                  user ? (
                    <Layout
                      user={user}
                      onLogout={handleLogout}
                      onUpdateSettings={(settings) => {
                        const updatedUser = { ...user, settings };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                      }}
                    />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </BrowserRouter>
        </LocalizationProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
