import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export const addExpense = async (expense) => {
  const userId = auth.currentUser.uid;
  await addDoc(collection(db, 'expenses'), { ...expense, userId });
};

export const getExpenses = async () => {
  const userId = auth.currentUser.uid;
  const q = query(collection(db, 'expenses'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addBudget = async (budget) => {
  const userId = auth.currentUser.uid;
  await addDoc(collection(db, 'budgets'), { ...budget, userId });
};

export const getBudgets = async () => {
  const userId = auth.currentUser.uid;
  const q = query(collection(db, 'budgets'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};