import React from 'react';
import { Typography, Box, Grid, TextField, Button, useTheme } from '@mui/material'; // Added useTheme import
import { styled } from '@mui/material/styles';
import { Email, Phone, LocationOn } from '@mui/icons-material';
import { motion } from 'framer-motion';

// Styled components for consistent design
const ContactContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #F5F5F5, #FFFFFF)',
  padding: theme.spacing(6),
  minHeight: '100vh',
  textAlign: 'center',
}));

const GlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const Contact = () => {
  const theme = useTheme(); // Now properly imported and used

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here (e.g., send email or API call)
    alert('Form submitted!'); // Placeholder for form submission
  };

  return (
    <ContactContainer>
      <Typography
        variant="h3"
        gutterBottom
        sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D', mb: 6 }}
      >
        Contact Us
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={6}>
          <GlassCard>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D' }}
            >
              Get in Touch
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
              Have questions or feedback? Reach out to us!
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                required
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <TextField
                label="Email"
                variant="outlined"
                type="email"
                fullWidth
                required
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <TextField
                label="Message"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                required
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    background: '#FF6200',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    borderRadius: '30px',
                    padding: theme.spacing(1.5, 4),
                    '&:hover': { background: '#FF8A00' },
                  }}
                >
                  Send Message
                </Button>
              </motion.div>
            </Box>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <GlassCard>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D' }}
            >
              Contact Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Email sx={{ color: '#FF6200' }} />
              <Typography variant="body1" sx={{ color: '#666' }}>
                support@paisacontroller.com
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Phone sx={{ color: '#FF6200' }} />
              <Typography variant="body1" sx={{ color: '#666' }}>
                +1 234 567 890
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocationOn sx={{ color: '#FF6200' }} />
              <Typography variant="body1" sx={{ color: '#666' }}>
                123 Finance Street, Money City, 12345
              </Typography>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>
    </ContactContainer>
  );
};

export default Contact;