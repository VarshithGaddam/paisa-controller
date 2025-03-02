import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, Button, CardContent, CircularProgress, Tooltip } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getExpenses, getBudgets } from '../services/firestore';
import { Facebook, Twitter, LinkedIn, AttachMoney, AccountBalance, Savings } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Joyride from 'react-joyride';
import Particles from 'react-tsparticles';
import Skeleton from '@mui/lab/Skeleton';

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #16161D 0%, #2E2E38 100%)',
  padding: theme.spacing(8),
  textAlign: 'center',
  color: '#FFFFFF',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(4) },
}));

const InsightsSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(180deg, #2E2E38 0%, #16161D 100%)',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    opacity: 0.3,
  },
}));

const BudgetsSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(180deg, #2E2E38 0%, #16161D 100%)',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    opacity: 0.3,
  },
}));

const AboutSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #16161D 0%, #2E2E38 100%)',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    animation: 'pulse 10s infinite ease-in-out',
    opacity: 0.2,
  },
  '@keyframes pulse': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
  },
}));

const WidgetCard = styled(motion.div)(({ theme }) => ({
  background: 'linear-gradient(145deg, #3C3C46, #2E2E38)',
  borderRadius: '16px',
  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.2)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(3),
  color: '#FFFFFF',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.05)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
  },
}));

const GlassCard = styled(motion.div)(({ theme }) => ({
  background: 'linear-gradient(145deg, #3C3C46, #2E2E38)',
  borderRadius: '16px',
  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.2)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(3),
  color: '#FFFFFF',
  border: '1px solid rgba(255,255,255,0.1)',
}));

const Footer = styled(Box)(({ theme }) => ({
  background: '#16161D',
  color: '#FFFFFF',
  padding: theme.spacing(4),
  textAlign: 'center',
  marginTop: theme.spacing(4),
}));

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [runTour, setRunTour] = useState(!localStorage.getItem('tourCompleted'));
  const savingsGoal = parseFloat(localStorage.getItem('savingsGoal') || 0);

  useEffect(() => {
    const fetchData = async () => {
      const expensesData = await getExpenses();
      const budgetsData = await getBudgets();
      setExpenses(expensesData);
      setBudgets(budgetsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalSaved = budgets.reduce((sum, b) => sum + (b.limit - b.spent > 0 ? b.limit - b.spent : 0), 0);
  const savingsProgress = savingsGoal ? (totalSaved / savingsGoal) * 100 : 0;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 960, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  const steps = [
    { target: '.hero', content: 'Welcome to Paisa Controller! Start managing your finances here.' },
    { target: '.insights', content: 'View key financial insights in this slideshow.' },
    { target: '.budgets', content: 'Monitor your budgets with sleek cards.' },
  ];

  const handleTourEnd = () => {
    localStorage.setItem('tourCompleted', 'true');
    setRunTour(false);
  };

  return (
    <>
      <Joyride steps={steps} run={runTour} callback={handleTourEnd} continuous showSkipButton />
      <Box sx={{ flexGrow: 1 }}>
        <HeroSection className="hero">
          <Particles
            options={{
              particles: {
                number: { value: 50, density: { enable: true, value_area: 800 } },
                color: { value: '#FFFFFF' },
                opacity: { value: 0.5 },
                size: { value: 3 },
                move: { enable: true, speed: 1 },
              },
              interactivity: { events: { onhover: { enable: true, mode: 'repulse' } } },
            }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
          <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 1, ease: 'easeInOut' }}>
            <AttachMoney sx={{ fontSize: 60, mb: 2, color: '#FFFFFF' }} />
          </motion.div>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'bold',
              fontStyle: 'italic',
              background: 'linear-gradient(45deg, #FFFFFF, #B0B0B0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '2px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Paisa Controller
          </Typography>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ mb: 4, fontFamily: 'Poppins, sans-serif', fontWeight: 300, color: 'rgba(255,255,255,0.9)' }}
          >
            Your Smart Financial Companion
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto', fontFamily: 'Poppins, sans-serif', color: 'rgba(255,255,255,0.8)' }}>
            Track expenses, manage budgets, and gain real-time insights with AI-powered efficiency.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #16161D, #2E2E38)',
                color: '#FFFFFF',
                '&:hover': { background: 'linear-gradient(45deg, #2E2E38, #16161D)' },
              }}
              size="large"
              component={Link}
              to="/expenses"
            >
              Start Tracking
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: '#FFFFFF',
                borderColor: '#FFFFFF',
                '&:hover': { borderColor: '#B0B0B0', background: 'rgba(255,255,255,0.1)' },
              }}
              component={Link}
              to="/reports"
            >
              View Insights
            </Button>
          </Box>
        </HeroSection>

        <InsightsSection className="insights">
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'bold',
              color: '#FFFFFF',
              letterSpacing: '1.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Financial Insights
          </Typography>
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(3)].map((_, i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '16px' }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Slider {...sliderSettings}>
              <Tooltip title={`Total expenditure: $${totalSpent.toFixed(2)}`}>
                <WidgetCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                      <CircularProgress variant="determinate" value={100} size={80} thickness={5} sx={{ color: '#dc004e' }} />
                      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h5" sx={{ color: '#dc004e', fontWeight: 'bold' }}>${totalSpent.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total Spent</Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>
                      Your total expenditure this period
                    </Typography>
                  </CardContent>
                </WidgetCard>
              </Tooltip>
              <Tooltip title={`${budgets.length} active budgets`}>
                <WidgetCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                      <CircularProgress variant="determinate" value={100} size={80} thickness={5} sx={{ color: '#36A2EB' }} />
                      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h5" sx={{ color: '#36A2EB', fontWeight: 'bold' }}>{budgets.length}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Budgets Overview</Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>
                      Active budgets currently monitored
                    </Typography>
                  </CardContent>
                </WidgetCard>
              </Tooltip>
              <Tooltip title={`Progress: ${Math.round(savingsProgress)}%`}>
                <WidgetCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                      <CircularProgress variant="determinate" value={savingsProgress} size={80} thickness={5} sx={{ color: '#4BC0C0' }} />
                      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h5" sx={{ color: '#4BC0C0', fontWeight: 'bold' }}>{Math.round(savingsProgress)}%</Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Savings Goal</Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>
                      ${totalSaved.toFixed(2)} / ${savingsGoal}
                    </Typography>
                  </CardContent>
                </WidgetCard>
              </Tooltip>
            </Slider>
          )}
        </InsightsSection>

        <BudgetsSection className="budgets">
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 'bold',
              color: '#FFFFFF',
              letterSpacing: '1.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            Your Budgets
          </Typography>
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(3)].map((_, i) => (
                <Grid item xs={12} sm={4} key={i}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '16px' }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {budgets.length > 0 ? (
                budgets.map((budget, index) => (
                  <Grid item xs={12} sm={6} md={4} key={budget.id}>
                    <Tooltip title={`Remaining: $${(budget.limit - budget.spent).toFixed(2)}`}>
                      <WidgetCard
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                            <CircularProgress
                              variant="determinate"
                              value={(budget.spent / budget.limit) * 100}
                              size={80}
                              thickness={5}
                              sx={{ color: budget.spent > budget.limit ? '#FF6384' : '#36A2EB' }}
                            />
                            <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography variant="h5" sx={{ color: budget.spent > budget.limit ? '#FF6384' : '#36A2EB', fontWeight: 'bold' }}>
                                {Math.round((budget.spent / budget.limit) * 100)}%
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{budget.category}</Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            Spent: ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, color: budget.spent > budget.limit ? '#FF6384' : '#4BC0C0' }}>
                            {budget.spent > budget.limit ? 'Overspent!' : 'On Track'}
                          </Typography>
                        </CardContent>
                      </WidgetCard>
                    </Tooltip>
                  </Grid>
                ))
              ) : (
                <Typography sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', width: '100%' }}>
                  No budgets set yet. Start managing now!
                </Typography>
              )}
            </Grid>
          )}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button variant="contained" sx={{ background: 'linear-gradient(45deg, #16161D, #2E2E38)', color: '#FFFFFF' }} component={Link} to="/budgets">
              Create Budget
            </Button>
          </Box>
        </BudgetsSection>

        <AboutSection>
          <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 'bold',
                fontStyle: 'italic',
                background: 'linear-gradient(45deg, #FFFFFF, #B0B0B0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '2px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Why Paisa Controller?
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{ maxWidth: 800, mx: 'auto', fontFamily: 'Poppins, sans-serif', color: 'rgba(255,255,255,0.8)' }}
            >
              Built with cutting-edge AI, Paisa Controller simplifies personal finance with real-time insights, intuitive design, and seamless cloud sync. Perfect for hackathon winners and everyday users alike!
            </Typography>
          </GlassCard>
        </AboutSection>

        <Footer>
          <Typography variant="h6" gutterBottom>
            Paisa Controller © 2025
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Powered by xAI | All Rights Reserved
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF' }}>
              <Facebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF' }}>
              <Twitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#FFFFFF' }}>
              <LinkedIn />
            </a>
          </Box>
        </Footer>
      </Box>
    </>
  );
};

export default Dashboard;