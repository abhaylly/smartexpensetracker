import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../lib/supabase.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ name: name.trim(), email: email.toLowerCase(), password: hashedPassword })
    .select('id, name, email, created_at')
    .single();

  if (error) {
    console.error('Registration error:', error);
    const supabaseError = {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
      code: error?.code
    };

    // Return more specific info so we can fix registration quickly.
    return res.status(500).json({
      error: supabaseError.message || supabaseError.details || supabaseError.hint || 'Registration failed. Please try again.',
      supabaseError
    });
  }

  res.status(201).json({ message: 'Account created successfully.', user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, name, email, password')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

export default router;
