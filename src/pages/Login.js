import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const LoginContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: theme.palette.background.default,
}));

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error.message);
    }
  };

  return (
    <LoginContainer>
      <Typography variant="h4" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
        Welcome to Financial Manager
      </Typography>
      <Button
        variant="contained"
        onClick={handleGoogleSignIn}
        sx={{ background: 'linear-gradient(45deg, #16161D, #2E2E38)', color: '#FFFFFF' }}
      >
        Sign in with Google
      </Button>
    </LoginContainer>
  );
};

export default Login;
