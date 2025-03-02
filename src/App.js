import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, Typography, Switch, Box, IconButton } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { SnackbarProvider } from 'notistack';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import About from './pages/About';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

// Theme Context
const ThemeContext = createContext();

export const useCustomTheme = () => useContext(ThemeContext);

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" />;
};

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#16161D'); // Default eigengrau

  const theme = createTheme({
    typography: { fontFamily: 'Poppins, sans-serif' },
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: primaryColor },
      secondary: { main: darkMode ? '#f48fb1' : '#dc004e' },
      background: {
        default: darkMode ? '#2E2E38' : '#E0E0E0',
        paper: darkMode ? '#3C3C46' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#FFFFFF' : '#16161D',
        secondary: darkMode ? '#B0B0B0' : '#666666',
      },
    },
  });

  return (
    <AuthProvider>
      <ThemeContext.Provider value={{ setPrimaryColor }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider maxSnack={3}>
            <Router>
              <AppBar position="static" sx={{ backgroundColor: primaryColor }}>
                <Toolbar>
                  <IconButton edge="start" color="inherit" aria-label="logo" sx={{ mr: 2 }}>
                    <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />
                  </IconButton>
                  <Typography variant="h6" sx={{ flexGrow: 1, color: '#FFFFFF' }}>
                    Paisa Controller
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Link to="/about" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
                      <Typography variant="body1">About</Typography>
                    </Link>
                    <Link to="/contact" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
                      <Typography variant="body1">Contact</Typography>
                    </Link>
                    <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} sx={{ color: '#FFFFFF' }} />
                  </Box>
                </Toolbar>
              </AppBar>
              <Navbar />
              <AnimatePresence>
                <Routes>
                  <Route path="/" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Login /></motion.div>} />
                  <Route path="/dashboard" element={<ProtectedRoute><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Dashboard /></motion.div></ProtectedRoute>} />
                  <Route path="/expenses" element={<ProtectedRoute><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Expenses /></motion.div></ProtectedRoute>} />
                  <Route path="/budgets" element={<ProtectedRoute><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Budgets /></motion.div></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Reports /></motion.div></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Settings /></motion.div></ProtectedRoute>} />
                  <Route path="/about" element={<ProtectedRoute><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><About /></motion.div></ProtectedRoute>} />
                  <Route path="/contact" element={<ProtectedRoute><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Contact /></motion.div></ProtectedRoute>} />
                </Routes>
              </AnimatePresence>
            </Router>
          </SnackbarProvider>
        </ThemeProvider>
      </ThemeContext.Provider>
    </AuthProvider>
  );
};

// Export only App here, as useCustomTheme is already exported above
export { App };