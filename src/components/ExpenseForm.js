import { useState } from 'react';
import { TextField, Button, Box, Input, FormControlLabel, Switch, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import { addExpense } from '../services/firestore';
import { categorizeExpense } from '../utils/categorizer';
import Tesseract from 'tesseract.js';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VoiceButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: '#FFFFFF',
  borderColor: '#4BC0C0',
  background: 'linear-gradient(45deg, #4BC0C0, #36A2EB)',
  boxShadow: '0 0 10px rgba(75, 192, 192, 0.5), 0 0 20px rgba(75, 192, 192, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #36A2EB, #4BC0C0)',
    boxShadow: '0 0 15px rgba(75, 192, 192, 0.7), 0 0 25px rgba(75, 192, 192, 0.5)',
    borderColor: '#36A2EB',
  },
}));

const ExpenseForm = ({ onExpenseAdded }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    Tesseract.recognize(file, 'eng')
      .then(({ data: { text } }) => {
        const amountMatch = text.match(/\$?(\d+\.?\d*)/);
        const descMatch = text.replace(amountMatch?.[0] || '', '').trim();
        setAmount(amountMatch ? amountMatch[1] : '');
        setDescription(descMatch || 'Receipt Item');
      });
  };

  const handleVoiceInput = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Your browser does not support speech recognition.');
      return;
    }
    SpeechRecognition.startListening();
    setTimeout(() => {
      SpeechRecognition.stopListening();
      const words = transcript.split(' ');
      const amountMatch = words.find(word => /^\d+\.?\d*$/.test(word));
      setAmount(amountMatch || '');
      setDescription(transcript.replace(amountMatch || '', '').trim() || 'Voice Entry');
      resetTranscript();
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const category = categorizeExpense(description);
    const expense = {
      amount: Number(amount),
      description,
      category,
      date: new Date().toISOString(),
      recurring: isRecurring,
      frequency: isRecurring ? frequency : null,
    };
    await addExpense(expense);
    setAmount('');
    setDescription('');
    setImage(null);
    setIsRecurring(false);
    setFrequency('monthly');
    if (onExpenseAdded) onExpenseAdded();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
        margin="normal"
        required
        InputLabelProps={{ style: { color: '#666666' } }}
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        margin="normal"
        required
        InputLabelProps={{ style: { color: '#666666' } }}
      />
      <Input type="file" accept="image/*" onChange={handleImageUpload} sx={{ mt: 2 }} />
      <FormControlLabel
        control={<Switch checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />}
        label="Recurring"
        sx={{ mt: 2, color: '#FFFFFF' }}
      />
      {isRecurring && (
        <Select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          fullWidth
          sx={{ mt: 2, color: '#FFFFFF', '& .MuiInputBase-input': { color: '#FFFFFF' } }}
        >
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
        </Select>
      )}
      <VoiceButton onClick={handleVoiceInput}>
        Voice Input
      </VoiceButton>
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 2, background: 'linear-gradient(45deg, #16161D, #2E2E38)', color: '#FFFFFF' }}
      >
        Add Expense
      </Button>
    </Box>
  );
};

export default ExpenseForm;