import React, { useEffect, useState } from 'react';
import { Typography, Box, Button, TextField, Paper, useTheme, CircularProgress, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add, Delete, Refresh } from '@mui/icons-material';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';

const ExpensesContainer = styled(Box)(({ theme }) => ({
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

const ExpenseItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  background: '#FFFFFF',
  borderRadius: '12px',
  marginBottom: theme.spacing(2),
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
}));

const Expenses = () => {
  const theme = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', date: '', purpose: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data once
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const userId = auth.currentUser?.uid || 'user123';

    try {
      console.log('Fetching data for user:', userId);
      let expensesQuery = collection(db, 'expenses');
      let budgetsQuery = collection(db, 'budgets');

      // Apply where clause if available
      if (typeof where === 'function') {
        expensesQuery = query(expensesQuery, where('userId', '==', userId));
        budgetsQuery = query(budgetsQuery, where('userId', '==', userId));
        console.log('Using filtered queries');
      } else {
        console.warn('where is not defined, fetching all data');
      }

      const [expensesSnapshot, budgetsSnapshot] = await Promise.all([
        getDocs(expensesQuery),
        getDocs(budgetsQuery),
      ]);

      const expensesData = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const budgetsData = budgetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log('Expenses fetched:', expensesData);
      console.log('Budgets fetched:', budgetsData);

      setExpenses(expensesData);
      setBudgets(budgetsData);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manual refresh function
  const handleRefresh = () => {
    setExpenses([]);
    setBudgets([]);
    setError(null);
    fetchData();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount || !newExpense.date || !newExpense.purpose) {
      alert('Please fill all fields');
      return;
    }
    const userId = auth.currentUser?.uid || 'user123';
    try {
      await addDoc(collection(db, 'expenses'), {
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: new Date(newExpense.date).toISOString(),
        purpose: newExpense.purpose, // Store the purpose
        userId,
        createdAt: new Date().toISOString(),
      });
      setNewExpense({ category: '', amount: '', date: '', purpose: '' });
      handleRefresh(); // Refresh data after adding
    } catch (error) {
      console.error('Error adding expense:', error.message);
      alert(`Failed to add expense: ${error.message}`);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteDoc(doc(db, 'expenses', id));
        handleRefresh(); // Refresh data after deleting
      } catch (error) {
        console.error('Error deleting expense:', error.message);
        alert(`Failed to delete expense: ${error.message}`);
      }
    }
  };

  return (
    <ExpensesContainer>
      <Typography
        variant="h3"
        gutterBottom
        sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D', textAlign: 'center', mb: 6 }}
      >
        Manage Expenses
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', color: '#FF6200', p: 4 }}>
          <Typography>{error}</Typography>
          <Button
            variant="contained"
            onClick={handleRefresh}
            sx={{ mt: 2, background: '#FF6200', color: '#FFFFFF', '&:hover': { background: '#FF8A00' } }}
          >
            Retry
          </Button>
        </Box>
      ) : (
        <>
          <GlassCard>
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
            <Box component="form" onSubmit={handleAddExpense} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                select
                label="Budget Category"
                name="category"
                value={newExpense.category}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                required
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {budgets.map((budget) => (
                  <MenuItem key={budget.id} value={budget.category}>
                    {budget.category} (₹{budget.limit.toFixed(2)})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Amount (₹)"
                name="amount"
                type="number"
                value={newExpense.amount}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                required
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <TextField
                label="Date"
                name="date"
                type="date"
                value={newExpense.date}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                sx={{ fontFamily: 'Poppins, sans-serif' }}
              />
              <TextField
                label="Purpose"
                name="purpose"
                value={newExpense.purpose}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                required
                sx={{ fontFamily: 'Poppins, sans-serif' }}
                helperText="e.g., Groceries, Taxi, etc."
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
                Add Expense
              </Button>
            </Box>
          </GlassCard>
          <GlassCard>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D', mb: 3 }}
            >
              Your Expenses
            </Typography>
            {expenses.length === 0 ? (
              <Typography sx={{ color: '#666', textAlign: 'center' }}>
                No expenses added yet. Start by adding one above!
              </Typography>
            ) : (
              expenses.map((expense) => (
                <ExpenseItem key={expense.id}>
                  <Box>
                    <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D' }}>
                      {expense.category} - ₹{expense.amount.toFixed(2)} (Purpose: {expense.purpose})
                    </Typography>
                    <Typography sx={{ fontFamily: 'Poppins, sans-serif', color: '#666' }}>
                      {new Date(expense.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => handleDeleteExpense(expense.id)}
                    color="error"
                    startIcon={<Delete />}
                    sx={{ minWidth: 'auto' }}
                  >
                    Delete
                  </Button>
                </ExpenseItem>
              ))
            )}
          </GlassCard>
        </>
      )}
    </ExpensesContainer>
  );
};

export default Expenses;