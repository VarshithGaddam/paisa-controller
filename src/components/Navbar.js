import React from 'react';
import { NavLink } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { Home, List, AccountBalance, PieChart, Settings as SettingsIcon, Info, ContactMail } from '@mui/icons-material';

const Navbar = () => {
  return (
    <BottomNavigation showLabels sx={{ mt: 2, backgroundColor: '#16161D', color: '#FFFFFF' }}>
      <BottomNavigationAction
        label="Home"
        icon={<Home />}
        component={NavLink}
        to="/dashboard"
        sx={{ color: '#FFFFFF', '&.active': { color: '#dc004e' } }}
      />
      <BottomNavigationAction
        label="Expenses"
        icon={<List />}
        component={NavLink}
        to="/expenses"
        sx={{ color: '#FFFFFF', '&.active': { color: '#dc004e' } }}
      />
      <BottomNavigationAction
        label="Budgets"
        icon={<AccountBalance />}
        component={NavLink}
        to="/budgets"
        sx={{ color: '#FFFFFF', '&.active': { color: '#dc004e' } }}
      />
      <BottomNavigationAction
        label="Reports"
        icon={<PieChart />}
        component={NavLink}
        to="/reports"
        sx={{ color: '#FFFFFF', '&.active': { color: '#dc004e' } }}
      />
      <BottomNavigationAction
        label="Settings"
        icon={<SettingsIcon />}
        component={NavLink}
        to="/settings"
        sx={{ color: '#FFFFFF', '&.active': { color: '#dc004e' } }}
      />
      <BottomNavigationAction
        label="About"
        icon={<Info />}
        component={NavLink}
        to="/about"
        sx={{ color: '#FFFFFF', '&.active': { color: '#dc004e' } }}
      />
      <BottomNavigationAction
        label="Contact"
        icon={<ContactMail />}
        component={NavLink}
        to="/contact"
        sx={{ color: '#FFFFFF', '&.active': { color: '#dc004e' } }}
      />
    </BottomNavigation>
  );
};

export default Navbar;