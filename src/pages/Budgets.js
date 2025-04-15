import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Box, Grid, Button, TextField, Paper, useTheme, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add, Delete, Refresh } from '@mui/icons-material';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Custom event to notify other components of budget/expense updates
const dispatchBudgetUpdate = () => {
  window.dispatchEvent(new CustomEvent('budgetUpdate'));
};

const BudgetsContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #F5F5F5, #FFFFFF)',
  padding: theme.spacing(6),
  minHeight: '100vh',
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const BudgetItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  background: '#FFFFFF',
  borderRadius: '12px',
  marginBottom: theme.spacing(2),
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
}));

const Budgets = () => {
  const theme = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [newBudget, setNewBudget] = useState({ category: '', limit: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    const budgetsQuery = query(collection(db, 'budgets'));
    const expensesQuery = query(collection(db, 'expenses'));

    const budgetsUnsubscribe = onSnapshot(budgetsQuery, (snapshot) => {
      const budgetsData = snapshot.docs
        .filter(doc => doc.data().userId === (auth.currentUser?.uid || 'user123'))
        .map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Budgets fetched:', budgetsData);
      setBudgets(budgetsData);
      dispatchBudgetUpdate(); // Notify other components
    }, (error) => console.error('Error fetching budgets:', error));

    const expensesUnsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs
        .filter(doc => doc.data().userId === (auth.currentUser?.uid || 'user123'))
        .map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Expenses fetched:', expensesData);
      setExpenses(expensesData);
      setLoading(false);
      dispatchBudgetUpdate(); // Notify other components
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

  const handleRefresh = () => {
    setExpenses([]);
    setBudgets([]);
    fetchData();
  };

  const budgetsWithSpent = budgets.map(budget => {
    const spent = expenses
      .filter(exp => exp.category?.toLowerCase().trim() === budget.category.toLowerCase().trim())
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
    console.log(`Budget: ${budget.category}, Spent: ${spent}`);
    return { ...budget, spent };
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBudget({ ...newBudget, [name]: value });
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.limit) {
      alert('Please fill all fields');
      return;
    }
    try {
      await addDoc(collection(db, 'budgets'), {
        category: newBudget.category,
        limit: parseFloat(newBudget.limit),
        userId: auth.currentUser?.uid || 'user123',
        createdAt: new Date().toISOString(),
      });
      setNewBudget({ category: '', limit: '' });
      dispatchBudgetUpdate(); // Notify after adding
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteDoc(doc(db, 'budgets', id));
        dispatchBudgetUpdate(); // Notify after deleting
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  return (
    <BudgetsContainer>
      <Typography variant="h3" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D', textAlign: 'center', mb: 6 }}>
        Manage Budgets
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <GlassCard>
            <Box component="form" onSubmit={handleAddBudget} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Category"
                name="category"
                value={newBudget.category}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                required
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <TextField
                label="Budget Limit (₹)"
                name="limit"
                type="number"
                value={newBudget.limit}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                required
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<Add />}
                sx={{
                  background: '#FF6200',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  borderRadius: '30px',
                  padding: theme.spacing(1.5, 4),
                  '&:hover': { background: '#FF8A00' },
                }}
              >
                Add Budget
              </Button>
            </Box>
          </GlassCard>
          <GlassCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D' }}>
                Your Budgets
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                sx={{ color: '#FF6200', borderColor: '#FF6200', '&:hover': { background: 'rgba(255, 98, 0, 0.1)' } }}
              >
                Refresh
              </Button>
            </Box>
            {budgetsWithSpent.length === 0 ? (
              <Typography sx={{ color: '#666', textAlign: 'center' }}>
                No budgets added yet. Start by adding one above!
              </Typography>
            ) : (
              budgetsWithSpent.map((budget) => {
                const progress = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                return (
                  <BudgetItem key={budget.id}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D' }}>
                        {budget.category} - ₹{budget.spent.toFixed(2)} / ₹{budget.limit.toFixed(2)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                          <CircularProgress
                            variant="determinate"
                            value={progress > 100 ? 100 : progress}
                            size={40}
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
                            <Typography variant="caption" sx={{ color: '#16161D', fontWeight: 'bold' }}>
                              {Math.round(progress)}%
                            </Typography>
                          </Box>
                        </Box>
                        <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: budget.spent > budget.limit ? '#FF6200' : '#4BC0C0' }}>
                          {budget.spent > budget.limit ? 'Overspent!' : 'On Track'}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      onClick={() => handleDeleteBudget(budget.id)}
                      color="error"
                      startIcon={<Delete />}
                      sx={{ minWidth: 'auto', textTransform: 'uppercase' }}
                    >
                      Delete
                    </Button>
                  </BudgetItem>
                );
              })
            )}
          </GlassCard>
        </>
      )}
    </BudgetsContainer>
  );
};

export default Budgets;