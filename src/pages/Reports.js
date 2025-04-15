import React, { useEffect, useState, useRef } from 'react';
import { Typography, Box, Grid, CircularProgress, Button } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import { Line, Bar, Chart, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import { onSnapshot, query, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { CSVLink } from 'react-csv';
import { motion } from 'framer-motion';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  CandlestickController,
  CandlestickElement
);

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const lightningFlash = keyframes`
  0% { box-shadow: 0 0 10px #000, 0 0 20px #000, 0 0 30px #000; }
  50% { box-shadow: 0 0 20px #000, 0 0 40px #000, 0 0 60px #000; }
  100% { box-shadow: 0 0 10px #000, 0 0 20px #000, 0 0 30px #000; }
`;

const ChartContainer = styled(Box)(({ theme }) => ({
  animation: `${fadeIn} 1s ease-in`,
  padding: theme.spacing(2),
  background: theme.palette.mode === 'dark' ? '#3C3C46' : '#E0E0E0',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    animation: `${lightningFlash} 1s infinite`,
  },
  height: '400px',
}));

const CarGauge = styled(motion.div)(({ theme, spentPercentage }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 120,
  height: 120,
  background: `conic-gradient(${theme.palette.primary.main} ${spentPercentage * 3.6}deg, #2E2E38 0deg)`,
  borderRadius: '50%',
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 100,
    height: 100,
    background: theme.palette.background.paper,
    borderRadius: '50%',
  },
}));

const GaugeText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  fontWeight: 'bold',
  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
}));

const Reports = () => {
  const theme = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const candlestickChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const waterfallChartRef = useRef(null);

  useEffect(() => {
    const budgetsQuery = query(collection(db, 'budgets'));
    const expensesQuery = query(collection(db, 'expenses'));

    const budgetsUnsubscribe = onSnapshot(budgetsQuery, (snapshot) => {
      const budgetsData = snapshot.docs
        .filter(doc => doc.data().userId === (auth.currentUser?.uid || 'user123'))
        .map(doc => ({ id: doc.id, ...doc.data(), spent: 0 }));
      setBudgets(budgetsData);
    }, (error) => console.error('Error fetching budgets:', error));

    const expensesUnsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs
        .filter(doc => doc.data().userId === (auth.currentUser?.uid || 'user123'))
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expensesData);
      // Update spent for each budget
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
      [lineChartRef, barChartRef, candlestickChartRef, pieChartRef, waterfallChartRef].forEach(ref => {
        if (ref.current) ref.current.destroy();
      });
    };
  }, []);

  const totalSpent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
  const spentPercentage = totalBudgetLimit ? (totalSpent / totalBudgetLimit) * 100 : 0;

  // Filter expenses by selected budget (using category)
  const filteredExpenses = selectedBudget ? expenses.filter(exp => exp.category?.toLowerCase().trim() === selectedBudget.category.toLowerCase().trim()) : expenses;

  // Pie Chart Data for Selected Budget (using Purpose)
  const getPurposeTotals = () =>
    filteredExpenses.reduce((acc, exp) => {
      acc[exp.purpose || 'Unknown'] = (acc[exp.purpose || 'Unknown'] || 0) + (exp.amount || 0); // Handle missing purpose
      return acc;
    }, {});
  const pieData = selectedBudget
    ? {
        labels: Object.keys(getPurposeTotals()),
        datasets: [
          {
            data: Object.values(getPurposeTotals()),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            borderColor: '#FFFFFF',
            borderWidth: 1,
          },
        ],
      }
    : { labels: [], datasets: [] };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#16161D', font: { family: 'Poppins, sans-serif', size: 14 } } },
      title: { display: true, text: `${selectedBudget?.category || 'Overall'} - Spending by Purpose`, color: '#16161D', font: { family: 'Poppins, sans-serif', size: 18, weight: 'bold' } },
    },
  };

  // Waterfall Chart Data for Selected Budget
  const waterfallData = selectedBudget
    ? [
        {
          label: selectedBudget.category,
          data: [0, selectedBudget.spent, selectedBudget.limit - selectedBudget.spent],
          backgroundColor: selectedBudget.spent > selectedBudget.limit ? '#FF6384' : '#36A2EB',
        },
      ]
    : [];
  const waterfallChartData = selectedBudget
    ? {
        labels: ['Starting', selectedBudget.category, 'Remaining'],
        datasets: [
          {
            label: 'Waterfall',
            data: [0, ...waterfallData[0].data],
            backgroundColor: ['#FFFFFF', ...waterfallData.map(w => w.backgroundColor), '#4BC0C0'],
            borderColor: '#16161D',
            borderWidth: 1,
          },
        ],
      }
    : { labels: [], datasets: [] };
  const waterfallOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: `${selectedBudget?.category || 'Overall'} - Waterfall: Spending vs Budget`, color: '#16161D', font: { family: 'Poppins, sans-serif', size: 18, weight: 'bold' } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Amount (₹)', color: '#16161D' }, ticks: { color: '#666' }, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
      x: { title: { display: true, text: 'Categories', color: '#16161D' }, ticks: { color: '#666' }, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
    },
  };

  // Line Chart Data for Selected Budget
  const dates = [...new Set(filteredExpenses.map(exp => new Date(exp.date).toLocaleDateString()))].sort();
  const lineData = selectedBudget
    ? {
        labels: dates,
        datasets: [
          {
            label: `${selectedBudget.category} Spending Over Time`,
            data: dates.map(date =>
              filteredExpenses
                .filter(exp => new Date(exp.date).toLocaleDateString() === date)
                .reduce((sum, exp) => sum + (exp.amount || 0), 0)
            ),
            borderColor: '#16161D',
            fill: false,
            tension: 0.4,
          },
        ],
      }
    : { labels: [], datasets: [] };

  // Bar Chart Data for Selected Budget
  const barData = selectedBudget
    ? {
        labels: ['Spent', 'Remaining'],
        datasets: [
          {
            label: `${selectedBudget.category} Budget`,
            data: [selectedBudget.spent, selectedBudget.limit - selectedBudget.spent],
            backgroundColor: ['#FF6384', '#36A2EB'],
          },
        ],
      }
    : { labels: [], datasets: [] };

  // Candlestick Data for Selected Budget
  const dailyData = selectedBudget
    ? dates.map(date => {
        const dailyExpenses = filteredExpenses.filter(exp => new Date(exp.date).toLocaleDateString() === date);
        const amounts = dailyExpenses.map(exp => exp.amount);
        return {
          x: new Date(date).getTime(),
          o: amounts.length ? amounts[0] : 0,
          h: amounts.length ? Math.max(...amounts) : 0,
          l: amounts.length ? Math.min(...amounts) : 0,
          c: amounts.length ? amounts[amounts.length - 1] : 0,
        };
      })
    : [];
  const candlestickData = selectedBudget
    ? {
        datasets: [
          {
            label: `${selectedBudget.category} Daily Spending (Candlestick)`,
            data: dailyData,
            borderColor: '#16161D',
            color: { up: 'rgba(0, 255, 0, 0.5)', down: 'rgba(255, 0, 0, 0.5)', unchanged: 'rgba(128, 128, 128, 0.5)' },
          },
        ],
      }
    : { datasets: [] };
  const candlestickOptions = {
    scales: {
      x: { type: 'time', time: { unit: 'day' }, title: { display: true, text: 'Date', color: '#16161D' } },
      y: { beginAtZero: true, title: { display: true, text: 'Amount (₹)', color: '#16161D' } },
    },
    plugins: { legend: { display: true }, tooltip: { enabled: true, backgroundColor: '#16161D', titleColor: '#FFFFFF', bodyColor: '#FFFFFF' } },
  };

  const getInsights = () => {
    if (expenses.length === 0) return "No expenses yet. Start tracking to get insights!";
    const overBudget = budgets.find(b => b.spent > b.limit && b.category === selectedBudget?.category);
    const topPurpose = Object.entries(getPurposeTotals()).reduce((a, b) => a[1] > b[1] ? a : b, [0, 0])[0];
    return overBudget
      ? `Consider reducing spending on ${overBudget.category} (₹${overBudget.spent.toFixed(2)} > ₹${overBudget.limit.toFixed(2)}). Top purpose: ${topPurpose}.`
      : `You are within budget limits for ${selectedBudget?.category || 'overall'}. Top spending purpose: ${topPurpose}. Keep it up!`;
  };

  const predictNextMonth = () => {
    if (expenses.length < 2) return "Add more expenses for predictions.";
    const monthlyTotals = expenses.reduce((acc, exp) => {
      const month = new Date(exp.date).getMonth();
      acc[month] = (acc[month] || 0) + (exp.amount || 0);
      return acc;
    }, {});
    const totals = Object.values(monthlyTotals);
    const avgIncrease = (totals[totals.length - 1] - totals[0]) / (totals.length - 1) || 0;
    return `Predicted next month for ${selectedBudget?.category || 'overall'}: ₹${(totals[totals.length - 1] + avgIncrease).toFixed(2)}`;
  };

  // CSV Data based on selected budget
  const csvData = selectedBudget
    ? filteredExpenses.map(exp => ({
        Amount: exp.amount,
        Description: exp.description || 'N/A',
        Category: exp.category,
        Purpose: exp.purpose || 'N/A',
        Date: new Date(exp.date).toLocaleDateString(),
      }))
    : expenses.map(exp => ({
        Amount: exp.amount,
        Description: exp.description || 'N/A',
        Category: exp.category,
        Purpose: exp.purpose || 'N/A',
        Date: new Date(exp.date).toLocaleDateString(),
      }));

  // Dynamic filename based on selection
  const csvFileName = selectedBudget ? `paisa-controller-${selectedBudget.category}-report.csv` : 'paisa-controller-report.csv';

  return (
    <Box sx={{ p: 3, background: theme => theme.palette.background.default }}>
      <Typography variant="h4" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
        Financial Reports
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ color: theme => theme.palette.text.primary, mb: 2 }}>
              Select a Budget to Visualize
            </Typography>
            {budgets.length === 0 ? (
              <Typography sx={{ color: '#666' }}>No budgets found. Add budgets in the Budgets page.</Typography>
            ) : (
              budgets.map((budget) => (
                <Button
                  key={budget.id}
                  variant="outlined"
                  onClick={() => setSelectedBudget(budget)}
                  sx={{ mr: 2, mb: 2, color: '#FF6200', borderColor: '#FF6200' }}
                >
                  {budget.category} (₹{budget.limit.toFixed(2)})
                </Button>
              ))
            )}
          </Box>
          {selectedBudget && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ChartContainer>
                  <Typography variant="h6" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
                    {selectedBudget.category} - Spending by Purpose (Pie)
                  </Typography>
                  {Object.keys(getPurposeTotals()).length === 0 ? (
                    <Typography sx={{ color: '#666', textAlign: 'center', height: '100%' }}>
                      No expenses for this budget.
                    </Typography>
                  ) : (
                    <Pie ref={pieChartRef} data={pieData} options={pieOptions} />
                  )}
                </ChartContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartContainer>
                  <Typography variant="h6" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
                    {selectedBudget.category} - Waterfall: Spending vs Budget
                  </Typography>
                  <Bar ref={waterfallChartRef} data={waterfallChartData} options={waterfallOptions} />
                </ChartContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartContainer>
                  <Typography variant="h6" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
                    {selectedBudget.category} - Spending Over Time
                  </Typography>
                  {dates.length === 0 ? (
                    <Typography sx={{ color: '#666', textAlign: 'center', height: '100%' }}>
                      No expenses for this budget.
                    </Typography>
                  ) : (
                    <Line ref={lineChartRef} data={lineData} />
                  )}
                </ChartContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartContainer>
                  <Typography variant="h6" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
                    {selectedBudget.category} - Budget vs Spent
                  </Typography>
                  <Bar ref={barChartRef} data={barData} />
                </ChartContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <ChartContainer>
                  <Typography variant="h6" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
                    {selectedBudget.category} - Daily Spending (Candlestick)
                  </Typography>
                  {dailyData.length === 0 ? (
                    <Typography sx={{ color: '#666', textAlign: 'center', height: '100%' }}>
                      No expenses for this budget.
                    </Typography>
                  ) : (
                    <Chart ref={candlestickChartRef} type="candlestick" data={candlestickData} options={candlestickOptions} />
                  )}
                </ChartContainer>
              </Grid>
            </Grid>
          )}
          <Typography variant="body1" sx={{ mt: 2, color: theme => theme.palette.text.secondary }}>{getInsights()}</Typography>
          <Typography variant="body1" sx={{ mt: 2, color: theme => theme.palette.text.secondary }}>{predictNextMonth()}</Typography>
          <Button variant="contained" sx={{ mt: 2, background: 'linear-gradient(45deg, #16161D, #2E2E38)', color: '#FFFFFF' }}>
            <CSVLink data={csvData} filename={csvFileName} style={{ color: '#FFFFFF', textDecoration: 'none' }}>
              Export to CSV
            </CSVLink>
          </Button>
        </>
      )}
    </Box>
  );
};

export default Reports;