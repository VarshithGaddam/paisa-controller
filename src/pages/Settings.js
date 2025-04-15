import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Avatar, FormControlLabel, Switch, FormControl, InputLabel, Select, MenuItem, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';
import { motion } from 'framer-motion';

const SettingsContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #F5F5F5, #FFFFFF)',
  padding: theme.spacing(4),
  minHeight: '100vh',
}));

const GlassCard = styled(motion.div)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(3),
  color: '#16161D',
  border: '1px solid rgba(255,255,255,0.1)',
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 'bold',
  color: '#16161D',
  letterSpacing: '1.5px',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: theme.spacing(2),
}));

const Settings = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const theme = useTheme();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR');
  const [language, setLanguage] = useState('en');
  const [savingsGoal, setSavingsGoal] = useState(localStorage.getItem('savingsGoal') || 0);
  const [primaryColor, setPrimaryColor] = useState(theme.palette.primary.main);
  const [rates, setRates] = useState({});
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  useEffect(() => {
    axios.get('https://api.exchangeratesapi.io/v1/latest?access_key=YOUR_API_KEY')
      .then(response => setRates(response.data.rates))
      .catch(error => console.error('Error fetching exchange rates:', error));
  }, []);

  const handleNameUpdate = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName });
      alert('Name updated successfully!');
    } catch (error) {
      console.error('Error updating name:', error.message);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result);
      updateProfile(auth.currentUser, { photoURL: reader.result })
        .catch(error => console.error('Error updating photo:', error.message));
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
    localStorage.setItem('currency', e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleSavingsGoalChange = (e) => {
    setSavingsGoal(e.target.value);
    localStorage.setItem('savingsGoal', e.target.value);
  };

  const handleColorChange = (e) => {
    setPrimaryColor(e.target.value);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  return (
    <SettingsContainer>
      <SectionTitle variant="h4">Settings</SectionTitle>

      <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Profile</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={photoURL} sx={{ mr: 2, width: 60, height: 60, bgcolor: '#16161D' }}>
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <TextField
              label="Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              sx={{ mb: 2, input: { color: '#16161D' }, label: { color: '#666' } }}
            />
            <Button
              variant="contained"
              sx={{ background: '#FF6200', color: '#FFFFFF', borderRadius: '20px' }}
              onClick={handleNameUpdate}
            >
              Update Name
            </Button>
          </Box>
        </Box>
        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ color: '#16161D' }} />
        <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
          Email: {user?.email}
        </Typography>
      </GlassCard>

      <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Customization</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: '#666' }}>Currency</InputLabel>
          <Select
            value={currency}
            onChange={handleCurrencyChange}
            label="Currency"
            sx={{ color: '#16161D' }}
          >
            {Object.keys(rates).map(curr => (
              <MenuItem key={curr} value={curr}>{curr}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: '#666' }}>Language</InputLabel>
          <Select
            value={language}
            onChange={handleLanguageChange}
            label="Language"
            sx={{ color: '#16161D' }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Switch defaultChecked={theme.palette.mode === 'dark'} />}
          label="Dark Mode"
          sx={{ color: '#16161D', mb: 2 }}
        />
        <TextField
          label="Savings Goal (₹)"
          type="number"
          value={savingsGoal}
          onChange={handleSavingsGoalChange}
          fullWidth
          sx={{ mb: 2, input: { color: '#16161D' }, label: { color: '#666' } }}
        />
        <TextField
          label="Primary Color"
          type="color"
          value={primaryColor}
          onChange={handleColorChange}
          fullWidth
          sx={{ mb: 2 }}
        />
      </GlassCard>

      <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Security</Typography>
        <Button
          variant="outlined"
          sx={{ color: '#FF6200', borderColor: '#FF6200', mb: 2, borderRadius: '20px' }}
          onClick={() => alert('Change Password feature coming soon!')}
        >
          Change Password
        </Button>
        <Button
          variant="contained"
          sx={{ background: '#FF6200', color: '#FFFFFF', borderRadius: '20px' }}
          onClick={() => setOpenLogoutDialog(true)}
        >
          Logout
        </Button>
      </GlassCard>

      <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Support & Info</Typography>
        <Button
          variant="text"
          sx={{ color: '#FF6200', mb: 1, display: 'block' }}
          href="mailto:support@paisacontroller.com"
        >
          Help & Support
        </Button>
        <Button
          variant="text"
          sx={{ color: '#FF6200' }}
          href="https://example.com/terms"
          target="_blank"
        >
          Terms & Privacy
        </Button>
      </GlassCard>

      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle sx={{ color: '#16161D' }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to log out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoutDialog(false)} sx={{ color: '#16161D' }}>Cancel</Button>
          <Button onClick={handleLogout} sx={{ color: '#FF6200' }}>Logout</Button>
        </DialogActions>
      </Dialog>
    </SettingsContainer>
  );
};

export default Settings;