export const categorizeExpense = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('food') || desc.includes('groceries') || desc.includes('restaurant')) return 'Food';
    if (desc.includes('transport') || desc.includes('gas') || desc.includes('taxi')) return 'Transportation';
    if (desc.includes('rent') || desc.includes('utility') || desc.includes('bill')) return 'Housing';
    if (desc.includes('entertainment') || desc.includes('movie') || desc.includes('game')) return 'Entertainment';
    return 'Miscellaneous';
  };