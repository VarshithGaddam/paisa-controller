import React, { useEffect, useState, useRef } from 'react';
import { Typography, Box, Grid, CircularProgress, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';
import { Pie, Line, Bar, Chart } from 'react-chartjs-2';
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
import { getExpenses, getBudgets } from '../services/firestore';
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
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const candlestickChartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const expensesData = await getExpenses();
      const budgetsData = await getBudgets();
      setExpenses(expensesData);
      setBudgets(budgetsData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      [pieChartRef, lineChartRef, barChartRef, candlestickChartRef].forEach(ref => {
        if (ref.current) ref.current.destroy();
      });
    };
  }, []);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const spentPercentage = totalBudgetLimit ? (totalSpent / totalBudgetLimit) * 100 : 0;

  const categoryData = {
    labels: [...new Set(expenses.map(exp => exp.category))],
    datasets: [{
      data: Object.values(expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {})),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
    }],
  };

  const dates = [...new Set(expenses.map(exp => new Date(exp.date).toLocaleDateString()))].sort();
  const lineData = {
    labels: dates,
    datasets: [{
      label: 'Spending Over Time',
      data: dates.map(date => 
        expenses.filter(exp => new Date(exp.date).toLocaleDateString() === date)
          .reduce((sum, exp) => sum + exp.amount, 0)
      ),
      borderColor: '#16161D',
      fill: false,
      tension: 0.4,
    }],
  };

  const barData = {
    labels: budgets.map(b => b.category),
    datasets: [
      {
        label: 'Budget Limit',
        data: budgets.map(b => b.limit),
        backgroundColor: '#36A2EB',
      },
      {
        label: 'Spent',
        data: budgets.map(b => b.spent || 0),
        backgroundColor: '#FF6384',
      },
    ],
  };

  const dailyData = dates.map(date => {
    const dailyExpenses = expenses.filter(exp => new Date(exp.date).toLocaleDateString() === date);
    const amounts = dailyExpenses.map(exp => exp.amount);
    return {
      x: new Date(date).getTime(),
      o: amounts.length ? amounts[0] : 0,
      h: amounts.length ? Math.max(...amounts) : 0,
      l: amounts.length ? Math.min(...amounts) : 0,
      c: amounts.length ? amounts[amounts.length - 1] : 0,
    };
  });

  const candlestickData = {
    datasets: [{
      label: 'Daily Spending (Candlestick)',
      data: dailyData,
      borderColor: '#16161D',
      color: {
        up: 'rgba(0, 255, 0, 0.5)',
        down: 'rgba(255, 0, 0, 0.5)',
        unchanged: 'rgba(128, 128, 128, 0.5)',
      },
    }],
  };

  const candlestickOptions = {
    scales: {
      x: {
        type: 'time',
        time: { unit: 'day' },
        title: { display: true, text: 'Date', color: '#16161D' },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Amount ($)', color: '#16161D' },
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        enabled: true,
        backgroundColor: '#16161D',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
      },
    },
  };

  const getInsights = () => {
    if (expenses.length === 0) {
      return "No expenses yet. Start tracking to get insights!";
    }
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    const maxCategory = Object.entries(categoryTotals).reduce((a, b) => (a[1] > b[1] ? a : b), ['', 0]);
    return `Consider reducing spending on ${maxCategory[0]} ($${maxCategory[1].toFixed(2)}) to stay within budget.`;
  };

  const predictNextMonth = () => {
    if (expenses.length < 2) return "Add more expenses for predictions.";
    const monthlyTotals = expenses.reduce((acc, exp) => {
      const month = new Date(exp.date).getMonth();
      acc[month] = (acc[month] || 0) + exp.amount;
      return acc;
    }, {});
    const totals = Object.values(monthlyTotals);
    const avgIncrease = (totals[totals.length - 1] - totals[0]) / (totals.length - 1);
    return `Predicted next month: $${(totals[totals.length - 1] + avgIncrease).toFixed(2)}`;
  };

  const csvData = expenses.map(exp => ({
    Amount: exp.amount,
    Description: exp.description,
    Category: exp.category,
    Date: new Date(exp.date).toLocaleDateString(),
  }));

  return (
    <Box sx={{ p: 3, background: theme => theme.palette.background.default }}>
      <Typography variant="h4" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
        Financial Reports
      </Typography>
      <ChartContainer sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
          Financial Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <CarGauge spentPercentage={spentPercentage} animate={{ rotate: spentPercentage * 1.8 - 90 }}>
              <GaugeText variant="h6">{Math.round(spentPercentage)}%</GaugeText>
            </CarGauge>
            <Typography variant="body1" align="center" sx={{ mt: 1, color: theme => theme.palette.text.secondary }}>
              Spending Gauge
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={spentPercentage}
                size={120}
                thickness={5}
                sx={{ color: theme => theme.palette.primary.main }}
              />
              <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  ${totalSpent.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" align="center" sx={{ mt: 1, color: theme => theme.palette.text.secondary }}>
              Total Spent
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={totalBudgetLimit ? ((totalBudgetLimit - totalSpent) / totalBudgetLimit) * 100 : 0}
                size={120}
                thickness={5}
                sx={{ color: 'success.main' }}
              />
              <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme => theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  ${(totalBudgetLimit - totalSpent).toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" align="center" sx={{ mt: 1, color: theme => theme.palette.text.secondary }}>
              Remaining Budget
            </Typography>
          </Grid>
        </Grid>
      </ChartContainer>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartContainer>
            <Typography variant="h6" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
              Category Breakdown
            </Typography>
            <Pie ref={pieChartRef} data={categoryData} />
          </ChartContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartContainer>
            <Typography variant="h6" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
              Spending Over Time
            </Typography>
            <Line ref={lineChartRef} data={lineData} />
          </ChartContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartContainer>
            <Typography variant="h6" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
              Budget vs Spent
            </Typography>
            <Bar ref={barChartRef} data={barData} />
          </ChartContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartContainer>
            <Typography variant="h6" gutterBottom sx={{ color: theme => theme.palette.text.primary }}>
              Daily Spending (Candlestick)
            </Typography>
            <Chart
              ref={candlestickChartRef}
              type="candlestick"
              data={candlestickData}
              options={candlestickOptions}
            />
          </ChartContainer>
        </Grid>
      </Grid>
      <Typography variant="body1" sx={{ mt: 2, color: theme => theme.palette.text.secondary }}>{getInsights()}</Typography>
      <Typography variant="body1" sx={{ mt: 2, color: theme => theme.palette.text.secondary }}>{predictNextMonth()}</Typography>
      <Button variant="contained" sx={{ mt: 2, background: 'linear-gradient(45deg, #16161D, #2E2E38)', color: '#FFFFFF' }}>
        <CSVLink data={csvData} filename="paisa-controller-report.csv" style={{ color: '#FFFFFF', textDecoration: 'none' }}>
          Export to CSV
        </CSVLink>
      </Button>
    </Box>
  );
};

export default Reports;