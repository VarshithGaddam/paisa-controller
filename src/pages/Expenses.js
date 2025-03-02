import React, { useEffect, useState } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import ExpenseForm from '../components/ExpenseForm';
import { getExpenses } from '../services/firestore';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ExpenseRow = styled(TableRow)(({ theme }) => ({
  animation: `${fadeIn} 0.5s ease-in`,
  backgroundColor: theme.palette.background.paper,
}));

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const data = await getExpenses();
    setExpenses(data);
  };

  const handleExpenseAdded = async () => {
    await fetchExpenses();
  };

  const filteredExpenses = filterCategory === 'All'
    ? expenses
    : expenses.filter(expense => expense.category === filterCategory);

  const categories = ['All', ...new Set(expenses.map(exp => exp.category))];

  return (
    <Box sx={{ p: 3, background: theme => theme.palette.background.default }}>
      <Typography variant="h4" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
        Expenses
      </Typography>
      <ExpenseForm onExpenseAdded={handleExpenseAdded} />
      <FormControl sx={{ mt: 2, minWidth: 120 }}>
        <InputLabel sx={{ color: theme => theme.palette.text.secondary }}>Filter by Category</InputLabel>
        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          label="Filter by Category"
          sx={{ color: theme => theme.palette.text.primary }}
        >
          {categories.map(cat => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#16161D' }}>
            <TableCell sx={{ color: '#FFFFFF' }}>Amount</TableCell>
            <TableCell sx={{ color: '#FFFFFF' }}>Description</TableCell>
            <TableCell sx={{ color: '#FFFFFF' }}>Category</TableCell>
            <TableCell sx={{ color: '#FFFFFF' }}>Date</TableCell>
            <TableCell sx={{ color: '#FFFFFF' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredExpenses.map(expense => (
            <ExpenseRow key={expense.id}>
              <TableCell sx={{ color: theme => theme.palette.text.primary }}>${expense.amount.toFixed(2)}</TableCell>
              <TableCell sx={{ color: theme => theme.palette.text.primary }}>{expense.description}</TableCell>
              <TableCell sx={{ color: theme => theme.palette.text.primary }}>{expense.category}</TableCell>
              <TableCell sx={{ color: theme => theme.palette.text.primary }}>{new Date(expense.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button color="error" size="small">Delete</Button>
              </TableCell>
            </ExpenseRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default Expenses;