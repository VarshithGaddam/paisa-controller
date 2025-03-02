import React, { useState } from 'react';
import { Typography, Box, Button, TextField, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const ContactContainer = styled(Box)(({ theme }) => ({
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

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData); // Placeholder for submission logic
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <ContactContainer>
      <SectionTitle variant="h4">Contact Us</SectionTitle>

      <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Get in Touch</Typography>
        {submitted ? (
          <Typography variant="body1" sx={{ color: '#4BC0C0' }}>
            Thank you for your message! We’ll get back to you soon.
          </Typography>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2, input: { color: '#FFFFFF' }, label: { color: 'rgba(255,255,255,0.8)' } }}
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2, input: { color: '#FFFFFF' }, label: { color: 'rgba(255,255,255,0.8)' } }}
              required
            />
            <TextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              sx={{ mb: 2, input: { color: '#FFFFFF' }, label: { color: 'rgba(255,255,255,0.8)' } }}
              required
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ background: 'linear-gradient(45deg, #16161D, #2E2E38)', color: '#FFFFFF' }}
            >
              Send Message
            </Button>
          </Box>
        )}
      </GlassCard>

      <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Contact Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>Email</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              support@paisacontroller.com
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>Social</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              @PaisaController on Twitter, Facebook
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>Support Hours</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Monday - Friday, 9 AM - 5 PM (IST)
            </Typography>
          </Grid>
        </Grid>
      </GlassCard>
    </ContactContainer>
  );
};

export default Contact;