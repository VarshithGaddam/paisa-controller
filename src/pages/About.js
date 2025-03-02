import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const AboutContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  padding: theme.spacing(4),
  minHeight: '100vh',
}));

const GlassCard = styled(motion.div)(({ theme }) => ({
  background: 'linear-gradient(145deg, #3C3C46, #2E2E38)',
  borderRadius: '16px',
  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.2)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(3),
  color: '#FFFFFF',
  border: '1px solid rgba(255,255,255,0.1)',
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 'bold',
  color: '#FFFFFF',
  letterSpacing: '1.5px',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  marginBottom: theme.spacing(2),
}));

const About = () => {
  return (
    <AboutContainer>
      <SectionTitle variant="h4">About Paisa Controller</SectionTitle>

      <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Our Mission</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Paisa Controller is an AI-powered personal finance app designed to simplify money management. Built with cutting-edge technology, it offers real-time insights, intuitive budget tracking, and seamless cloud sync to empower users to take control of their finances effortlessly.
        </Typography>
      </GlassCard>

      <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Meet the Team</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>Varshith - Lead Developer</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Passionate about AI and finance, Varshith drives the technical vision of Paisa Controller.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>Team xAI - Innovators</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Powered by xAI, our team brings cutting-edge solutions to personal finance.
            </Typography>
          </Grid>
        </Grid>
      </GlassCard>

      <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Why Choose Us?</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          With features like receipt scanning, multi-currency support, and AI-driven insights, Paisa Controller stands out as a smart, reliable companion for managing your money—whether you're a hackathon enthusiast or a daily user.
        </Typography>
      </GlassCard>
    </AboutContainer>
  );
};

export default About;