import { collection, getDocs, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Fetch expenses (initial load)
export const getExpenses = async () => {
  const expensesCol = collection(db, 'expenses');
  const expensesSnapshot = await getDocs(expensesCol);
  return expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Real-time listener for expenses
export const onSnapshotExpenses = (callback, errorCallback) => {
  return onSnapshot(
    collection(db, 'expenses'),
    (snapshot) => {
      const expensesData = snapshot.docs
        .filter(doc => doc.data().userId === (auth.currentUser?.uid || 'user123')) // Filter by user
        .map(doc => ({ id: doc.id, ...doc.data() }));
      callback(expensesData);
    },
    errorCallback
  );
};

// Fetch budgets (initial load)
export const getBudgets = async () => {
  const budgetsCol = collection(db, 'budgets');
  const budgetsSnapshot = await getDocs(budgetsCol);
  return budgetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Real-time listener for budgets
export const onSnapshotBudgets = (callback, errorCallback) => {
  return onSnapshot(
    collection(db, 'budgets'),
    (snapshot) => {
      const budgetsData = snapshot.docs
        .filter(doc => doc.data().userId === (auth.currentUser?.uid || 'user123')) // Filter by user
        .map(doc => ({ id: doc.id, ...doc.data() }));
      callback(budgetsData);
    },
    errorCallback
  );
};

// Add expense (for Expenses.js)
export const addExpense = async (expense) => {
  const expensesCol = collection(db, 'expenses');
  await addDoc(expensesCol, {
    ...expense,
    userId: auth.currentUser?.uid || 'user123',
    createdAt: new Date().toISOString(),
  });
};

// Delete expense (for Expenses.js)
export const deleteExpense = async (id) => {
  const expenseDoc = doc(db, 'expenses', id);
  await deleteDoc(expenseDoc);
};

// Add budget (for Budgets.js)
export const addBudget = async (budget) => {
  const budgetsCol = collection(db, 'budgets');
  await addDoc(budgetsCol, {
    ...budget,
    userId: auth.currentUser?.uid || 'user123',
    createdAt: new Date().toISOString(),
  });
};

// Delete budget (for Budgets.js)
export const deleteBudget = async (id) => {
  const budgetDoc = doc(db, 'budgets', id);
  await deleteDoc(budgetDoc);
};