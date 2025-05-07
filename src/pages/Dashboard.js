import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Box, Grid, Button, CardContent, CircularProgress, Tooltip, Fab, Modal, TextField } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Facebook, Twitter, LinkedIn, CurrencyRupee, Email, Phone, Store, Info, Chat } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Joyride from 'react-joyride';
import Particles from 'react-tsparticles';
import Skeleton from '@mui/lab/Skeleton';
import { Refresh } from '@mui/icons-material';

// Define styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF6200 0%, #FF8A00 100%)',
  padding: theme.spacing(8, 2),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '0 0 50px 50px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
}));

const InsightsSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 2),
  background: '#FFFFFF',
}));

const BudgetsSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 2),
  background: 'linear-gradient(135deg, #F5F5F5, #FFFFFF)',
}));

const AboutSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 2),
  background: '#FFFFFF',
  textAlign: 'center',
}));

const Footer = styled(Box)(({ theme }) => ({
  background: '#1A1A1A',
  color: '#FFFFFF',
  padding: theme.spacing(6, 2),
  textAlign: 'center',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
}));

const GlassCard = styled(motion.div)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const WidgetCard = styled(motion.div)(({ theme }) => ({
  background: '#FFFFFF',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const FooterLink = styled(Typography)(({ theme }) => ({
  color: '#CCCCCC',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  fontSize: '0.9rem',
  '&:hover': {
    color: '#FF6200',
    textDecoration: 'underline',
  },
}));

const ChatModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  padding: theme.spacing(2),
}));

const ChatBox = styled(Box)(({ theme }) => ({
  width: '350px',
  height: '500px',
  background: theme.palette.mode === 'dark' ? '#1A1A2E' : '#FFFFFF',
  borderRadius: '15px',
  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  overflowY: 'auto',
  background: theme.palette.mode === 'dark' ? '#16213E' : '#F9F9F9',
}));

const ChatInput = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  gap: theme.spacing(1),
}));

const Message = styled(Box)(({ theme, sender }) => ({
  margin: theme.spacing(1, 0),
  padding: theme.spacing(1, 2),
  borderRadius: '10px',
  maxWidth: '70%',
  background: sender === 'bot' ? (theme.palette.mode === 'dark' ? '#2E2E2E' : '#E0E0E0') : (theme.palette.mode === 'dark' ? '#4A90E2' : '#4A90E2'),
  color: sender === 'bot' ? theme.palette.text.primary : '#FFFFFF',
  alignSelf: sender === 'bot' ? 'flex-start' : 'flex-end',
}));

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [runTour, setRunTour] = useState(!localStorage.getItem('tourCompleted'));
  const savingsGoal = parseFloat(localStorage.getItem('savingsGoal') || 0);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  // Fetch data with real-time updates
  const fetchData = useCallback(() => {
    setLoading(true);
    const budgetsQuery = query(collection(db, 'budgets'), where('userId', '==', auth.currentUser?.uid || 'user123'));
    const expensesQuery = query(collection(db, 'expenses'), where('userId', '==', auth.currentUser?.uid || 'user123'));

    const budgetsUnsubscribe = onSnapshot(budgetsQuery, (snapshot) => {
      const budgetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Budgets fetched:', budgetsData);
      setBudgets(budgetsData);
    }, (error) => console.error('Error fetching budgets:', error));

    const expensesUnsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Expenses fetched:', expensesData);
      setExpenses(expensesData);
      // Update budgets with spent amounts
      setBudgets(prevBudgets =>
        prevBudgets.map(budget => ({
          ...budget,
          spent: expensesData
            .filter(exp => exp.category?.toLowerCase().trim() === budget.category.toLowerCase().trim())
            .reduce((sum, exp) => sum + (exp.amount || 0), 0),
        }))
      );
      setLoading(false);
    }, (error) => {
      console.error('Error fetching expenses:', error);
      setLoading(false);
    });

    return () => {
      budgetsUnsubscribe();
      expensesUnsubscribe();
    };
  }, [auth.currentUser?.uid]);

  useEffect(() => {
    const cleanup = fetchData();
    return cleanup;
  }, [fetchData]);

  // Handle budget updates from other components
  useEffect(() => {
    const handleBudgetUpdate = () => {
      console.log('Budget update event received, refreshing data...');
      fetchData();
    };
    window.addEventListener('budgetUpdate', handleBudgetUpdate);
    return () => window.removeEventListener('budgetUpdate', handleBudgetUpdate);
  }, [fetchData]);

  // Manual refresh function
  const handleRefresh = () => {
    setExpenses([]);
    setBudgets([]);
    fetchData();
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
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
    { target: '.hero', content: 'Welcome to Financial Manager! Manage your finances with ease.' },
    { target: '.insights', content: 'Get quick financial insights with these widgets.' },
    { target: '.budgets', content: 'Track your budgets in real-time.' },
    { target: '.stocks', content: 'Explore stock market data and link your budgets.' },
  ];

  const handleTourEnd = () => {
    localStorage.setItem('tourCompleted', 'true');
    setRunTour(false);
  };

  // Chatbot Logic
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = { text: inputMessage, sender: 'user', timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMessage]);

    // Bot response logic
    let botResponse = { text: "Hello! I'm your financial assistant. How can I help you today?", sender: 'bot', timestamp: new Date().toLocaleTimeString() };

    if (inputMessage.toLowerCase().includes('budget')) {
      const overspentBudgets = budgets.filter(b => (b.spent || 0) > b.limit);
      if (overspentBudgets.length > 0) {
        botResponse = {
          text: `Alert! You have overspent in ${overspentBudgets.map(b => b.category).join(', ')}. Consider adjusting your limits. Current budgets: ${budgets.map(b => `${b.category}: ₹${b.limit} (Spent: ₹${b.spent})`).join(', ')}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
        };
      } else {
        botResponse = {
          text: `Your budgets are on track! Current budgets: ${budgets.map(b => `${b.category}: ₹${b.limit} (Spent: ₹${b.spent})`).join(', ')}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString(),
        };
      }
    } else if (inputMessage.toLowerCase().includes('savings')) {
      botResponse = {
        text: `Your savings progress is ${Math.round(savingsProgress)}% towards a goal of ₹${savingsGoal}. You've saved ₹${totalSaved.toFixed(2)} so far. Keep it up!`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
    } else if (inputMessage.toLowerCase().includes('expense')) {
      botResponse = {
        text: `Your total expenses are ₹${totalSpent.toFixed(2)}. Review your spending in the Expenses section to optimize!`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
    } else if (inputMessage.toLowerCase().includes('help')) {
      botResponse = {
        text: 'I can help with: \n- Budget status (type "budget")\n- Savings progress (type "savings")\n- Expense overview (type "expense")\n- General advice (ask away!)',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
      };
    }

    setTimeout(() => setMessages(prev => [...prev, botResponse]), 500); // Simulate bot delay
    setInputMessage('');
  };

  return (
    <>
      <Joyride steps={steps} run={runTour} callback={handleTourEnd} continuous showSkipButton />
      <Box sx={{ flexGrow: 1 }}>
        <HeroSection className="hero">
          <Particles
            options={{
              particles: { number: { value: 50, density: { enable: true, value_area: 800 } }, color: { value: '#FFFFFF' }, opacity: { value: 0.5 }, size: { value: 3 }, move: { enable: true, speed: 1 } },
              interactivity: { events: { onhover: { enable: true, mode: 'repulse' } } },
            }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }}>
            <CurrencyRupee sx={{ fontSize: 80, mb: 2, color: '#FFFFFF' }} />
          </motion.div>
          <Typography variant="h2" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#FFFFFF', letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Financial Manager
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300, color: '#FFFFFF', mb: 4 }}>
            Track expenses, manage budgets, and save smarter!
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              sx={{ background: '#FFFFFF', color: '#FF6200', fontWeight: 'bold', borderRadius: '30px', padding: theme.spacing(1.5, 4), '&:hover': { background: '#F5F5F5' } }}
              size="large"
              component={Link}
              to="/expenses"
            >
              Start Tracking
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ color: '#FFFFFF', borderColor: '#FFFFFF', borderRadius: '30px', padding: theme.spacing(1.5, 4), '&:hover': { borderColor: '#F5F5F5', background: 'rgba(255,255,255,0.1)' } }}
              component={Link}
              to="/reports"
            >
              View Insights
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ color: '#FFFFFF', borderColor: '#FFFFFF', borderRadius: '30px', padding: theme.spacing(1.5, 4), '&:hover': { borderColor: '#F5F5F5', background: 'rgba(255,255,255,0.1)' } }}
              component={Link}
              to="/stocks"
              className="stocks"
            >
              Explore Stocks
            </Button>
          </Box>
        </HeroSection>

        <InsightsSection className="insights">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              sx={{ color: '#FF6200', borderColor: '#FF6200', '&:hover': { background: 'rgba(255, 98, 0, 0.1)' } }}
            >
              Refresh
            </Button>
          </Box>
          <Typography variant="h4" gutterBottom align="center" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D', mb: 4 }}>
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
          ) : expenses.length === 0 && budgets.length === 0 ? (
            <Typography sx={{ color: '#666', textAlign: 'center', width: '100%' }}>
              No data available. Start by adding expenses or budgets!
            </Typography>
          ) : (
            <Slider {...sliderSettings}>
              <Tooltip title={`Total expenditure: ₹${totalSpent.toFixed(2)}`}>
                <WidgetCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <CardContent sx={{ textAlign: 'center', padding: theme.spacing(4) }}>
                    <Typography
                      variant="h4"
                      sx={{
                        color: '#FF6200',
                        fontWeight: 'bold',
                        fontFamily: 'Poppins, sans-serif',
                        lineHeight: 1.2,
                        mb: 2,
                      }}
                    >
                      ₹{totalSpent.toFixed(2)}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#16161D' }}>
                      Total Spent
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                      Your total expenditure this period
                    </Typography>
                  </CardContent>
                </WidgetCard>
              </Tooltip>
              <Tooltip title={`${budgets.length} active budgets`}>
                <WidgetCard initial={{ opacity: 0, y: 50}} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                      <CircularProgress variant="determinate" value={100} size={80} thickness={5} sx={{ color: '#36A2EB' }} />
                      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h5" sx={{ color: '#36A2EB', fontWeight: 'bold' }}>
                          {budgets.length}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#16161D' }}>
                      Budgets Overview
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                      Active budgets currently monitored
                    </Typography>
                  </CardContent>
                </WidgetCard>
              </Tooltip>
              <Tooltip title={`Progress: ${Math.round(savingsProgress)}%`}>
                <WidgetCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                      <CircularProgress variant="determinate" value={savingsProgress > 100 ? 100 : savingsProgress} size={80} thickness={5} sx={{ color: '#4BC0C0' }} />
                      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h5" sx={{ color: '#4BC0C0', fontWeight: 'bold' }}>
                          {Math.round(savingsProgress)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#16161D' }}>
                      Savings Goal
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                      ₹{totalSaved.toFixed(2)} / ₹{savingsGoal}
                    </Typography>
                  </CardContent>
                </WidgetCard>
              </Tooltip>
            </Slider>
          )}
        </InsightsSection>

        <BudgetsSection className="budgets">
          <Typography variant="h4" gutterBottom align="center" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D', mb: 4 }}>
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
          ) : budgets.length === 0 ? (
            <Typography sx={{ color: '#666', textAlign: 'center', width: '100%' }}>
              No budgets set yet. Start managing now!
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {budgets.map((budget, index) => {
                const progress = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                return (
                  <Grid item xs={12} sm={6} md={4} key={budget.id}>
                    <Tooltip title={`Remaining: ₹${(budget.limit - budget.spent).toFixed(2)}`}>
                      <WidgetCard
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                            <CircularProgress
                              variant="determinate"
                              value={progress > 100 ? 100 : progress}
                              size={80}
                              thickness={5}
                              sx={{ color: budget.spent > budget.limit ? '#FF6200' : '#36A2EB' }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="h5" sx={{ color: budget.spent > budget.limit ? '#FF6200' : '#36A2EB', fontWeight: 'bold' }}>
                                {Math.round(progress)}%
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#16161D' }}>
                            {budget.category}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Spent: ₹{budget.spent.toFixed(2)} / ₹{budget.limit.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1, color: budget.spent > budget.limit ? '#FF6200' : '#4BC0C0' }}>
                            {budget.spent > budget.limit ? 'Overspent!' : 'On Track'}
                          </Typography>
                        </CardContent>
                      </WidgetCard>
                    </Tooltip>
                  </Grid>
                );
              })}
            </Grid>
          )}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              sx={{ background: '#FF6200', color: '#FFFFFF', fontWeight: 'bold', borderRadius: '30px', padding: theme.spacing(1.5, 4), '&:hover': { background: '#FF8A00' } }}
              component={Link}
              to="/budgets"
            >
              Create Budget
            </Button>
          </Box>
        </BudgetsSection>

        <AboutSection>
          <GlassCard initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D' }}>
              Why Paisa Controller?
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 800, mx: 'auto', fontFamily: 'Poppins, sans-serif', color: '#666' }}>
              Built with cutting-edge AI, Paisa Controller simplifies personal finance with real-time insights, intuitive design, and seamless cloud sync. Perfect for managing your expenses, budgets, stocks, and predictions on the go!
            </Typography>
          </GlassCard>
        </AboutSection>

        <Footer>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                About Us
              </Typography>
              <FooterLink component={Link} to="/about">
                Our Mission
              </FooterLink>
              <FooterLink component={Link} to="/about">
                Meet the Team
              </FooterLink>
              <FooterLink component={Link} to="/about">
                Why Choose Us
              </FooterLink>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Contact Us
              </Typography>
              <FooterLink href="mailto:support@paisacontroller.com">
                <Email sx={{ mr: 1 }} /> support@paisacontroller.com
              </FooterLink>
              <FooterLink href="tel:+1234567890">
                <Phone sx={{ mr: 1 }} /> +1 234 567 890
              </FooterLink>
              <FooterLink component={Link} to="/contact">
                <Info sx={{ mr: 1 }} /> Contact Form
              </FooterLink>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Follow Us
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <Facebook sx={{ color: '#FFFFFF', '&:hover': { color: '#FF6200' } }} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter sx={{ color: '#FFFFFF', '&:hover': { color: '#FF6200' } }} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <LinkedIn sx={{ color: '#FFFFFF', '&:hover': { color: '#FF6200' } }} />
                </a>
              </Box>
              <FooterLink href="https://play.google.com/store" target="_blank">
                <Store sx={{ mr: 1 }} /> Get the App
              </FooterLink>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Legal
              </Typography>
              <FooterLink href="https://example.com/terms" target="_blank">
                Terms of Service
              </FooterLink>
              <FooterLink href="https://example.com/privacy" target="_blank">
                Privacy Policy
              </FooterLink>
              <FooterLink href="https://example.com/cookies" target="_blank">
                Cookie Policy
              </FooterLink>
            </Grid>
          </Grid>
          <Typography variant="body2" sx={{ mt: 4 }}>
            Paisa Controller © 2025 | Powered by xAI | All Rights Reserved
          </Typography>
        </Footer>

        {/* Chatbot Floating Button */}
        <Fab
          color="primary"
          aria-label="chat"
          sx={{
            position: 'fixed',
            bottom: theme.spacing(2),
            right: theme.spacing(2),
            background: '#FF6200',
            '&:hover': { background: '#FF8A00' },
          }}
          onClick={() => setChatOpen(true)}
        >
          <Chat />
        </Fab>

        {/* Chatbot Modal */}
        <ChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          aria-labelledby="chat-modal-title"
        >
          <ChatBox>
            <Typography
              id="chat-modal-title"
              variant="h6"
              sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, background: theme.palette.mode === 'dark' ? '#2E2E2E' : '#F5F5F5', color: '#16161D' }}
            >
              Financial Assistant
            </Typography>
            <ChatMessages>
              {messages.map((msg, index) => (
                <Message key={index} sender={msg.sender}>
                  <Typography variant="body2">{msg.text}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: '#666' }}>
                    {msg.timestamp}
                  </Typography>
                </Message>
              ))}
            </ChatMessages>
            <ChatInput>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                sx={{ background: theme.palette.mode === 'dark' ? '#2E2E2E' : '#FFFFFF' }}
              />
              <Button
                variant="contained"
                sx={{ background: '#FF6200', color: '#FFFFFF', '&:hover': { background: '#FF8A00' } }}
                onClick={handleSendMessage}
              >
                Send
              </Button>
            </ChatInput>
          </ChatBox>
        </ChatModal>
      </Box>
    </>
  );
};

export default Dashboard;
