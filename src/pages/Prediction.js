import React, { useState, useRef, useEffect } from 'react';
import { Typography, Box, Button, Paper, CircularProgress, Grid, useTheme, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { motion } from 'framer-motion';
import Papa from 'papaparse'; // For CSV parsing
import Chart from 'chart.js/auto'; // Already in project
import 'chartjs-plugin-datalabels'; // Optional for data labels on sparklines (npm install chartjs-plugin-datalabels if needed)

// Styled Components
const PredictionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  background: 'linear-gradient(135deg, #F5F5F5, #E0E0E0)',
  minHeight: '100vh',
  overflowX: 'hidden',
}));

const UploadCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderRadius: '25px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  transition: 'transform 0.3s ease',
  '&:hover': { transform: 'translateY(-5px)' },
}));

const ResultCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 240, 240, 0.9))',
  backdropFilter: 'blur(10px)',
  borderRadius: '25px',
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255, 98, 0, 0.1)',
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '300px',
  marginTop: theme.spacing(2),
}));

const SparklineContainer = styled(Box)(({ theme }) => ({
  height: '50px',
  width: '100%',
  position: 'relative',
}));

const Badge = styled(motion.div)(({ theme, color }) => ({
  padding: theme.spacing(0.5, 1.5),
  borderRadius: '15px',
  background: color || '#36A2EB',
  color: '#FFFFFF',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  display: 'inline-block',
  textTransform: 'uppercase',
}));

const Prediction = () => {
  const theme = useTheme();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictionData, setPredictionData] = useState(null);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const sparklineRefs = useRef({});

  // Handle file upload
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
      setError(null);
    } else {
      setError('Please upload a valid CSV file.');
      setFile(null);
    }
  };

  // Parse CSV and predict
  const predictFromCSV = () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setPredictionData(null);

    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const data = result.data
          .filter(row => row.Amount && row.Category && !isNaN(parseFloat(row.Amount.replace(/,/g, ''))) && row.Date)
          .map(row => ({
            date: new Date(row.Date.split('/').reverse().join('-') || '2025-01-01'),
            category: row.Category.toLowerCase().trim(),
            amount: parseFloat(row.Amount.replace(/,/g, '')),
            type: 'expense',
          }));
        if (data.length === 0) {
          setError('No valid data found in the CSV. Ensure columns match: Amount, Category, Date.');
          setLoading(false);
          return;
        }

        console.log('Parsed data:', data);

        // Aggregate by category and month
        const monthlyData = {};
        data.forEach(row => {
          const month = row.date.toLocaleString('default', { month: 'long', year: 'numeric' });
          const category = row.category;
          const amount = row.amount;
          if (!monthlyData[category]) monthlyData[category] = {};
          if (!monthlyData[category][month]) monthlyData[category][month] = 0;
          monthlyData[category][month] += amount;
        });

        // Simple Moving Average (SMA) for next month prediction
        const predictNextMonth = (categoryData) => {
          const months = Object.keys(categoryData).sort(); // Define months locally
          if (months.length < 2) return categoryData[months[0]] || 0;

          const lastTwoMonths = months.slice(-2).map(m => categoryData[m]);
          const sma = lastTwoMonths.reduce((sum, val) => sum + val, 0) / 2;
          const growthRate = (lastTwoMonths[1] - lastTwoMonths[0]) / (lastTwoMonths[0] || 1) || 0;
          return sma + (sma * growthRate);
        };

        // Generate predictions
        const predictions = {};
        for (const category in monthlyData) {
          const lastMonth = Object.keys(monthlyData[category]).sort().pop();
          const currentSpending = monthlyData[category][lastMonth] || 0;
          const nextMonthPrediction = predictNextMonth(monthlyData[category]);
          const percentageChange = currentSpending ? ((nextMonthPrediction - currentSpending) / currentSpending * 100) : 0;
          const monthCount = Object.keys(monthlyData[category]).length; // Recalculate months here
          const confidenceScore = Math.min(95, 70 + (monthCount * 5)); // Use local monthCount
          predictions[category] = {
            current: currentSpending,
            predicted: nextMonthPrediction,
            percentageChange,
            confidenceScore,
            suggestion: nextMonthPrediction > 40000 ? 'Increase Budget' : 'Maintain Budget',
            trend: Object.values(monthlyData[category]).slice(-5), // Last 5 months for sparkline
          };
        }

        setPredictionData(predictions);
        renderChart(predictions);
        renderSparklines(predictions);
        setLoading(false);
      },
      error: (err) => {
        setError('Error parsing CSV: ' + err.message);
        setLoading(false);
      },
    });
  };

  // Render main chart
  const renderChart = (data) => {
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    const labels = Object.keys(data);
    const currentData = labels.map(cat => data[cat].current);
    const predictedData = labels.map(cat => data[cat].predicted);

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Current Spending (₹)',
            data: currentData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
          {
            label: 'Predicted Next Month (₹)',
            data: predictedData,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Amount (₹)' } } },
        plugins: { legend: { position: 'top' } },
      },
    });
  };

  // Render sparkline for each category
  const renderSparklines = (data) => {
    Object.entries(sparklineRefs.current).forEach(([category, ref]) => {
      if (ref?.chartInstance) ref.chartInstance.destroy();
      const ctx = ref?.getContext('2d');
      if (!ctx) return;

      ref.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data[category].trend.map((_, i) => i + 1),
          datasets: [{
            data: data[category].trend,
            borderColor: '#FF6200',
            backgroundColor: 'rgba(255, 98, 0, 0.2)',
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { display: false }, y: { display: false } },
          elements: { line: { tension: 0.4 } },
        },
      });
    });
  };

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
      Object.values(sparklineRefs.current).forEach(ref => {
        if (ref?.chartInstance) ref.chartInstance.destroy();
      });
    };
  }, []);

  return (
    <PredictionContainer>
      <Typography variant="h3" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#16161D', textAlign: 'center', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
        Prediction Analysis
      </Typography>
      <UploadCard>
        <Typography variant="h6" gutterBottom sx={{ color: '#16161D', fontFamily: 'Poppins, sans-serif' }}>
          Upload Report CSV
        </Typography>
        <input
          accept=".csv"
          style={{ display: 'none' }}
          id="upload-file"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="upload-file">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            sx={{ background: '#FF6200', color: '#FFFFFF', '&:hover': { background: '#FF8A00' }, mt: 2, borderRadius: '20px' }}
          >
            Choose File
          </Button>
        </label>
        {file && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography sx={{ mt: 2, color: '#16161D', fontFamily: 'Poppins, sans-serif' }}>Selected file: {file.name}</Typography>
            <Button
              variant="contained"
              onClick={predictFromCSV}
              sx={{ background: '#36A2EB', color: '#FFFFFF', '&:hover': { background: '#4BC0C0' }, mt: 2, borderRadius: '20px' }}
              disabled={loading}
            >
              Analyze Prediction
            </Button>
          </motion.div>
        )}
        {loading && <CircularProgress sx={{ mt: 2, color: '#FF6200' }} />}
        {error && <Typography color="error" sx={{ mt: 2, fontFamily: 'Poppins, sans-serif' }}>{error}</Typography>}
      </UploadCard>
      {predictionData && (
        <ResultCard
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: '#16161D', fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Prediction Results
          </Typography>
          <Grid container spacing={3}>
            {Object.entries(predictionData).map(([category, data]) => (
              <Grid item xs={12} sm={6} key={category}>
                <Box sx={{ p: 3, background: 'rgba(255, 255, 255, 0.8)', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                  <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', color: '#FF6200', mb: 1 }}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Typography>
                  <Typography sx={{ color: '#16161D', mb: 1 }}>Current: ₹{data.current.toFixed(2)}</Typography>
                  <Typography sx={{ color: '#16161D', mb: 1 }}>Predicted Next Month: ₹{data.predicted.toFixed(2)}</Typography>
                  <Typography sx={{ color: '#16161D', mb: 1 }}>
                    Change: {data.percentageChange.toFixed(2)}% {data.percentageChange > 0 ? '↑' : '↓'}
                  </Typography>
                  <Typography sx={{ color: '#16161D', mb: 1 }}>Confidence: {data.confidenceScore}%</Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={Math.min(100, (data.predicted / 50000) * 100)}
                      size={60}
                      thickness={4}
                      sx={{ color: data.predicted > 40000 ? '#FF6200' : '#36A2EB' }}
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
                        {Math.round((data.predicted / 50000) * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <SparklineContainer>
                    <canvas ref={el => (sparklineRefs.current[category] = el)} />
                  </SparklineContainer>
                  <Badge
                    color={data.predicted > 40000 ? '#FF6200' : '#36A2EB'}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {data.suggestion}
                  </Badge>
                </Box>
              </Grid>
            ))}
          </Grid>
          <ChartContainer>
            <canvas ref={chartRef} />
          </ChartContainer>
        </ResultCard>
      )}
    </PredictionContainer>
  );
};

export default Prediction;