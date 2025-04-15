import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Typography, Box, CircularProgress, Grid, Paper } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Chart from 'chart.js/auto'; // Ensure chart.js is installed: npm install chart.js

// Styled Components
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: theme.palette.mode === 'dark' ? '#1A1A2E' : '#F5F5F5',
  minHeight: '100vh',
}));

const StockCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.primary,
  background: theme.palette.mode === 'dark' ? '#16213E' : '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
}));

const TickerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  padding: theme.spacing(1),
  background: theme.palette.mode === 'dark' ? '#0F3460' : '#E0E0E0',
  borderRadius: '8px',
  marginBottom: theme.spacing(2),
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '250px',
  padding: theme.spacing(2),
  background: theme.palette.mode === 'dark' ? '#16213E' : '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  marginBottom: theme.spacing(2),
}));

const Stocks = () => {
  const theme = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canvasReady, setCanvasReady] = useState(false); // Track canvas readiness
  const chartRefs = useRef([]);
  const chartInstancesRef = useRef({});

  useEffect(() => {
    // Initialize chartRefs array based on number of stocks
    chartRefs.current = Array(3).fill().map((_, i) => chartRefs.current[i] || null);

    // Fetch budgets from Firestore (optional, can be hardcoded)
    const budgetsQuery = query(collection(db, 'budgets'), where('userId', '==', auth.currentUser?.uid || 'user123'));
    const budgetsUnsubscribe = onSnapshot(budgetsQuery, (snapshot) => {
      const budgetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), spent: 0 }));
      console.log('Budgets fetched:', budgetsData);
      // Optionally update with hardcoded values if no data
      const hardcodedBudgets = [
        { id: '1', category: 'Home', limit: 48000, spent: 0 },
        { id: '2', category: 'Office', limit: 38000, spent: 0 },
      ];
      setBudgets(budgetsData.length > 0 ? budgetsData : hardcodedBudgets);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching budgets:', error);
      // Fallback to hardcoded budgets if fetch fails
      setBudgets([
        { id: '1', category: 'Home', limit: 48000, spent: 0 },
        { id: '2', category: 'Office', limit: 38000, spent: 0 },
      ]);
      setLoading(false);
    });

    // Remove expense fetch since we're using hardcoded budgets
    // Fetch stock data (simulated)
    const fetchStocks = () => {
      const symbols = ['AAPL', 'GOOGL', 'MSFT'];
      const stockData = [];
      for (const symbol of symbols) {
        try {
          let price, volume, changePercent, changeColor;
          if (symbol === 'AAPL') {
            price = 197.961; // Real-time from 09:49 AM PDT, April 11, 2025
            const prevPrice = 195.806; // 12:15 PM data point
            changePercent = ((price - prevPrice) / prevPrice * 100).toFixed(2);
            changeColor = price >= prevPrice ? 'green' : 'red';
            volume = '50,000,000';
          } else if (symbol === 'GOOGL') {
            price = 150.50;
            const prevPrice = 149.20;
            changePercent = ((price - prevPrice) / prevPrice * 100).toFixed(2);
            changeColor = price >= prevPrice ? 'green' : 'red';
            volume = '30,000,000';
          } else if (symbol === 'MSFT') {
            price = 420.75;
            const prevPrice = 418.90;
            changePercent = ((price - prevPrice) / prevPrice * 100).toFixed(2);
            changeColor = price >= prevPrice ? 'green' : 'red';
            volume = '40,000,000';
          }
          stockData.push({ symbol, price, volume, changePercent, changeColor });
        } catch (error) {
          console.error(`Error fetching stock ${symbol}:`, error.message);
          stockData.push({ symbol, price: 'N/A', volume: 'N/A', changePercent: 'N/A', changeColor: 'gray' });
        }
      }
      console.log('Processed stock data:', stockData);
      setStocks(stockData);
    };

    fetchStocks();
    const stockInterval = setInterval(fetchStocks, 600000); // Update every 10 minutes
    return () => {
      budgetsUnsubscribe();
      clearInterval(stockInterval);
      Object.values(chartInstancesRef.current).forEach(chart => chart?.destroy());
    };
  }, []); // Empty dependency array to run only on mount

  // Use layout effect for chart updates with readiness check
  useLayoutEffect(() => {
    const updateCharts = () => {
      if (!canvasReady || !chartRefs.current.every(ref => ref)) {
        console.warn('Canvas not ready or refs not set, skipping chart creation');
        return;
      }
      stocks.forEach((stock, index) => {
        const ctx = chartRefs.current[index]?.getContext('2d');
        if (!ctx) {
          console.error(`Canvas context not found for ${stock.symbol} at index ${index}`);
          return;
        }
        if (chartInstancesRef.current[stock.symbol]) {
          chartInstancesRef.current[stock.symbol].destroy();
        }
        const chartData = {
          labels: ['09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45'],
          datasets: [{
            label: `${stock.symbol} Price (USD)`,
            data: getChartData(stock.symbol, stock.price).map(Number), // Ensure numeric data
            borderColor: getRandomColor(index),
            backgroundColor: getRandomColor(index, 0.2),
            fill: true,
            tension: 0.4,
          }],
        };
        if (chartData.datasets[0].data.some(isNaN)) {
          console.warn(`Invalid data for ${stock.symbol}:`, chartData.datasets[0].data);
          return;
        }
        chartInstancesRef.current[stock.symbol] = new Chart(ctx, {
          type: 'line',
          data: chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: false, title: { display: true, text: 'Price (USD)' } } },
            plugins: { legend: { display: true, position: 'top' } },
          },
        });
      });
    };
    updateCharts();
  }, [stocks, canvasReady]); // Re-run when stocks or canvas readiness changes

  // Simulate chart data based on symbol
  const getChartData = (symbol, currentPrice) => {
    const baseData = {
      AAPL: [190.766, 191.448, 191.407, 189.938, 192.972, 192.323, 192.783, 193.353, 194.6, 195.599, 195.909, 195.806, 197.762, 197.984],
    };
    if (symbol === 'AAPL') return baseData.AAPL;
    const offset = symbol === 'GOOGL' ? 150 : 400;
    return baseData.AAPL.map(p => {
      const scaled = p * (currentPrice / 197.961) + (offset - 150);
      return isNaN(scaled) ? 0 : scaled; // Fallback to 0 for invalid values
    });
  };

  // Generate random color for each chart
  const getRandomColor = (index, alpha = 1) => {
    const colors = ['rgba(75, 192, 192', 'rgba(255, 99, 132', 'rgba(54, 162, 235'];
    return `${colors[index % colors.length]}, ${alpha})`;
  };

  // Set canvas readiness after refs are assigned
  const setCanvasRefs = (index, el) => {
    chartRefs.current[index] = el;
    if (chartRefs.current.every(ref => ref)) {
      setCanvasReady(true);
      console.log('All canvas refs set, charts ready');
    }
  };

  return (
    <DashboardContainer>
      <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
        Stock Trading Dashboard
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TickerContainer>
            {stocks.length > 0 ? (
              stocks.map((stock) => (
                <StockCard key={stock.symbol} sx={{ minWidth: '200px', marginRight: theme.spacing(2) }}>
                  <Typography variant="h6" sx={{ color: stock.changeColor }}>
                    {stock.symbol}: ${stock.price !== 'N/A' ? stock.price.toFixed(2) : 'N/A'} ({stock.changePercent !== 'N/A' ? `${stock.changePercent}%` : 'N/A'})
                  </Typography>
                  <Typography variant="body2">Volume: {stock.volume || 'N/A'}</Typography>
                </StockCard>
              ))
            ) : (
              <Typography sx={{ color: '#666', padding: theme.spacing(2) }}>No stock data available.</Typography>
            )}
          </TickerContainer>

          <Grid container spacing={3}>
            {stocks.map((stock, index) => (
              <Grid item xs={12} md={4} key={stock.symbol}>
                <ChartContainer>
                  <canvas ref={el => setCanvasRefs(index, el)} id={`chart-${stock.symbol}`} />
                  {!chartInstancesRef.current[stock.symbol] && (
                    <Typography sx={{ color: '#666', position: 'absolute' }}> {stock.symbol}.</Typography>
                  )}
                </ChartContainer>
                <Typography variant="h6" sx={{ color: theme.palette.text.primary, textAlign: 'center', mt: 1 }}>
                  {stock.symbol} Chart
                </Typography>
              </Grid>
            ))}
            <Grid item xs={12} md={12}>
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 2 }}>
                Budgets Linked to Stocks
              </Typography>
              {budgets.length === 0 ? (
                <Typography sx={{ color: '#666' }}>No budgets added yet. Add budgets in the Budgets page.</Typography>
              ) : (
                budgets.map((budget) => (
                  <StockCard key={budget.id}>
                    <Typography sx={{ fontWeight: 'bold', color: '#16161D' }}>
                      {budget.category}: Limit: ₹{budget.limit?.toFixed(2) || 'N/A'}, Spent: ₹{budget.spent?.toFixed(2) || 'N/A'}
                    </Typography>
                  </StockCard>
                ))
              )}
            </Grid>
          </Grid>
        </>
      )}
    </DashboardContainer>
  );
};

export default Stocks;