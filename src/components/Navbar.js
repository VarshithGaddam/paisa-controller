import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button, Box, useTheme } from '@mui/material'; // Added Box import
import { Home, Receipt, AccountBalanceWallet, BarChart, Settings, Info, ContactMail, CurrencyRupee, ShowChart, TrendingUp } from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const bounceAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const AnimatedIcon = styled(motion.div)(({ theme }) => ({
  animation: `${bounceAnimation} 2s infinite`,
  color: theme.palette.primary.contrastText,
  fontSize: '2.5rem',
  transition: 'color 0.3s ease',
  '&:hover': { color: '#FF6200' },
}));

const NavbarContainer = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #1A1A1A, #2E2E2E)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  padding: theme.spacing(1, 2),
}));

const Navbar = () => {
  const theme = useTheme();

  return (
    <NavbarContainer position="static">
      <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              color: '#FFFFFF',
              textDecoration: 'none',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'bold',
              mr: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <CurrencyRupee sx={{ mr: 1, fontSize: '2rem', color: '#FF6200' }} /> Financial Manager
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton component={Link} to="/" color="inherit">
            <AnimatedIcon whileHover={{ scale: 1.2 }}>
              <Home />
            </AnimatedIcon>
          </IconButton>
          <IconButton component={Link} to="/expenses" color="inherit">
            <AnimatedIcon whileHover={{ scale: 1.2 }}>
              <Receipt />
            </AnimatedIcon>
          </IconButton>
          <IconButton component={Link} to="/budgets" color="inherit">
            <AnimatedIcon whileHover={{ scale: 1.2 }}>
              <AccountBalanceWallet />
            </AnimatedIcon>
          </IconButton>
          <IconButton component={Link} to="/reports" color="inherit">
            <AnimatedIcon whileHover={{ scale: 1.2 }}>
              <BarChart />
            </AnimatedIcon>
          </IconButton>
          {/* New Stocks and Prediction Sections */}
          <IconButton component={Link} to="/stocks" color="inherit">
            <AnimatedIcon whileHover={{ scale: 1.2 }}>
              <ShowChart />
            </AnimatedIcon>
          </IconButton>
          <IconButton component={Link} to="/prediction" color="inherit">
            <AnimatedIcon whileHover={{ scale: 1.2 }}>
              <TrendingUp />
            </AnimatedIcon>
          </IconButton>
          <IconButton component={Link} to="/settings" color="inherit">
            <AnimatedIcon whileHover={{ scale: 1.2 }}>
              <Settings />
            </AnimatedIcon>
          </IconButton>
          <IconButton component={Link} to="/about" color="inherit">
            <AnimatedIcon whileHover={{ scale: 1.2 }}>
              <Info />
            </AnimatedIcon>
          </IconButton>
          <IconButton component={Link} to="/contact" color="inherit">
            <AnimatedIcon whileHover={{ scale: 1.2 }}>
              <ContactMail />
            </AnimatedIcon>
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" component={Link} to="/about" sx={{ color: '#FFFFFF' }}>
            About
          </Button>
          <Button color="inherit" component={Link} to="/contact" sx={{ color: '#FFFFFF' }}>
            Contact
          </Button>
          <IconButton edge="end" color="inherit" sx={{ background: '#FF6200', borderRadius: '50%', '&:hover': { background: '#FF8A00' } }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
              <Typography sx={{ color: '#FFFFFF', fontSize: '1.5rem' }}>●</Typography>
            </motion.div>
          </IconButton>
        </Box>
      </Toolbar>
    </NavbarContainer>
  );
};

export default Navbar;
