import express from 'express';
import supabase from '../lib/supabase.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { category, type, startDate, endDate } = req.query;
  const userId = req.user.id;

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  if (type && type !== 'all') {
    query = query.eq('type', type);
  }
  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data: transactions, error } = await query;

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch transactions.' });
  }

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  res.status(200).json({
    transactions,
    summary: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    }
  });
});

router.post('/', async (req, res) => {
  const { type, amount, category, date, description } = req.body;
  const userId = req.user.id;

  if (!type || !amount || !category || !date) {
    return res.status(400).json({ error: 'Type, amount, category, and date are required.' });
  }

  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'Type must be income or expense.' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number.' });
  }

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type,
      amount: parsedAmount,
      category: category.trim(),
      date,
      description: description ? description.trim() : ''
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to add transaction.' });
  }

  res.status(201).json({ transaction });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type, amount, category, date, description } = req.body;
  const userId = req.user.id;

  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existing) {
    return res.status(404).json({ error: 'Transaction not found.' });
  }

  const updates = {};
  if (type !== undefined) {
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Type must be income or expense.' });
    }
    updates.type = type;
  }
  if (amount !== undefined) {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }
    updates.amount = parsedAmount;
  }
  if (category !== undefined) updates.category = category.trim();
  if (date !== undefined) updates.date = date;
  if (description !== undefined) updates.description = description.trim();

  const { data: transaction, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to update transaction.' });
  }

  res.status(200).json({ transaction });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existing) {
    return res.status(404).json({ error: 'Transaction not found.' });
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return res.status(500).json({ error: 'Failed to delete transaction.' });
  }

  res.status(200).json({ message: 'Transaction deleted successfully.' });
});

export default router;
