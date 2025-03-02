import React, { useEffect, useState } from 'react';
import { Typography, Box, Button, TextField, Grid, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { addBudget, getBudgets } from '../services/firestore';
import { useSnackbar } from 'notistack';
import { query, collection, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

const BudgetOverview = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  background: '#16161D',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
}));

const GlassCard = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(145deg, #3C3C46, #2E2E38)',
  borderRadius: '16px',
  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 8px 16px rgba(0,0,0,0.2)',
  backdropFilter: 'blur(10px)',
  padding: theme.spacing(3),
  color: '#FFFFFF',
  border: '1px solid rgba(255,255,255,0.1)',
}));

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const fetchBudgets = async () => {
    const data = await getBudgets();
    setBudgets(data);
  };

  useEffect(() => {
    fetchBudgets();
    const q = query(collection(db, 'budgets'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach(doc => {
        const { spent, limit, category } = doc.data();
        if (spent > limit) {
          enqueueSnackbar(`Budget "${category}" exceeded!`, { variant: 'warning' });
        }
      });
      setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAddBudget = async () => {
    if (category && limit) {
      await addBudget({ category, limit: Number(limit), spent: 0 });
      setCategory('');
      setLimit('');
      await fetchBudgets();
    }
  };

  const handleShareBudget = (budgetId) => {
    const shareLink = `${window.location.origin}/budget/${budgetId}`;
    navigator.clipboard.writeText(shareLink);
    enqueueSnackbar('Budget link copied to clipboard!', { variant: 'success' });
  };

  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
  const totalLimit = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const overallProgress = totalLimit ? (totalSpent / totalLimit) * 100 : 0;

  return (
    <Box sx={{ p: 3, background: theme => theme.palette.background.default }}>
      <Typography variant="h4" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
        Budgets
      </Typography>
      <BudgetOverview>
        <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
          Overall Budget Progress
        </Typography>
        <Box sx={{ position: 'relative', display: 'inline-flex', mt: 2 }}>
          <CircularProgress
            variant="determinate"
            value={overallProgress}
            size={100}
            thickness={5}
            sx={{ color: '#16161D' }}
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
            <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
              {Math.round(overallProgress)}%
            </Typography>
          </Box>
        </Box>
      </BudgetOverview>
      <Box sx={{ mt: 3, mb: 2 }}>
        <TextField
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ mr: 2 }}
          required
          InputLabelProps={{ style: { color: '#666666' } }}
        />
        <TextField
          label="Limit"
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          sx={{ mr: 2 }}
          required
          InputLabelProps={{ style: { color: '#666666' } }}
        />
        <Button
          variant="contained"
          onClick={handleAddBudget}
          sx={{ background: 'linear-gradient(45deg, #16161D, #2E2E38)', color: '#FFFFFF', '&:hover': { backgroundColor: '#2E2E38' } }}
        >
          Add Budget
        </Button>
      </Box>
      <Grid container spacing={3}>
        {budgets.map(budget => (
          <Grid item xs={12} sm={6} md={4} key={budget.id}>
            <GlassCard>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{budget.category}</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Spent: ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <CircularProgress
                  variant="determinate"
                  value={(budget.spent / budget.limit) * 100}
                  size={60}
                  thickness={5}
                  sx={{ color: budget.spent > budget.limit ? '#FF6384' : '#36A2EB' }}
                />
                <Typography variant="body2" sx={{ mt: 1, color: budget.spent > budget.limit ? '#FF6384' : '#4BC0C0' }}>
                  {budget.spent > budget.limit ? 'Overspent!' : `${Math.round((budget.spent / budget.limit) * 100)}% Used`}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1, color: '#FFFFFF', borderColor: '#FFFFFF' }}
                onClick={() => handleShareBudget(budget.id)}
              >
                Share
              </Button>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Budgets;