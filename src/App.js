import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Button, Box, Typography } from '@mui/material';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import About from './pages/About';
import Contact from './pages/Contact';
import Stocks from './pages/Stocks'; // New import
import Prediction from './pages/Prediction'; // New import

// SignIn component to handle authentication
const SignIn = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/'); // Redirect to dashboard after sign-in
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', padding: '50px' }}>
      <Typography variant="h1" gutterBottom>
        Please Sign In to Access Paisa Controller
      </Typography>
      <Button
        variant="contained"
        onClick={handleGoogleSignIn}
        sx={{
          background: '#FF6200',
          color: '#FFFFFF',
          fontWeight: 'bold',
          borderRadius: '30px',
          padding: '10px 20px',
          '&:hover': { background: '#FF8A00' },
        }}
      >
        Sign In with Google
      </Button>
    </Box>
  );
};

// SignOut component (optional, can be added to Navbar later)
const SignOutButton = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to sign-in page
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={handleSignOut}
      sx={{ color: '#FF6200', borderColor: '#FF6200', '&:hover': { background: 'rgba(255, 98, 0, 0.1)' } }}
    >
      Sign Out
    </Button>
  );
};

const theme = createTheme({
  palette: {
    primary: { main: '#FF6200' },
    background: { default: '#F5F5F5' },
    text: { primary: '#16161D' },
  },
  typography: { fontFamily: 'Poppins, sans-serif' },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ textAlign: 'center', padding: '50px' }}>
          <Typography>Loading...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true }}> {/* Optional: Suppresses the v7 warning */}
        <Navbar user={user} SignOutButton={SignOutButton} />
        <Routes>
          {user ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/stocks" element={<Stocks />} /> {/* New route */}
              <Route path="/prediction" element={<Prediction />} /> {/* New route */}
            </>
          ) : (
            <Route path="*" element={<SignIn />} />
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;