import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const AboutContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #F5F5F5, #FFFFFF)',
  padding: theme.spacing(6),
  minHeight: '100vh',
  textAlign: 'center',
}));

const GlassCard = styled(motion.div)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const About = () => {
  return (
    <AboutContainer>
      <Typography
        variant="h3"
        gutterBottom
        sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D', mb: 6 }}
      >
        About Paisa Controller
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#16161D', mb: 2 }}>
              Our Mission
            </Typography>
            <Typography sx={{ color: '#666' }}>
              At Paisa Controller, our mission is to empower individuals to take control of their finances with ease and confidence. We provide AI-driven insights to help you manage expenses, budgets, and savings effectively.
            </Typography>
          </GlassCard>
        </Grid>
        <Grid item xs={12}>
          <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#16161D', mb: 2 }}>
              Meet the Team
            </Typography>
            <Typography sx={{ color: '#666' }}>
              We are a passionate team of developers, designers, and financial enthusiasts dedicated to creating tools that make personal finance simple and accessible for everyone.
            </Typography>
          </GlassCard>
        </Grid>
        <Grid item xs={12}>
          <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#16161D', mb: 2 }}>
              Why Choose Us
            </Typography>
            <Typography sx={{ color: '#666' }}>
              With real-time insights, a user-friendly interface, and secure cloud sync, Paisa Controller stands out as your go-to financial companion. Join thousands of users who trust us to manage their money smarter.
            </Typography>
          </GlassCard>
        </Grid>
      </Grid>
    </AboutContainer>
  );
};

export default About;