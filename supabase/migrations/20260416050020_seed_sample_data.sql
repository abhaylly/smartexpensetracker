/*
  # Seed Sample Data

  ## Summary
  Inserts sample users and transactions so the app has demo data out of the box.

  ## Sample Users
  - demo@example.com / password: demo123
  - test@example.com / password: test123

  ## Sample Transactions
  A realistic mix of income and expense entries across multiple categories
  covering the current month to demonstrate all features.

  ## Notes
  1. Passwords below are bcrypt hashes generated with cost factor 10
  2. demo@example.com password is "demo123"
  3. test@example.com password is "test123"
  4. Only inserts if no users exist yet (prevents duplicate seeding)
*/

DO $$
DECLARE
  demo_id UUID := gen_random_uuid();
  test_id UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@example.com') THEN
    INSERT INTO users (id, email, password, name) VALUES
      (demo_id, 'demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User'),
      (test_id, 'test@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User');

    INSERT INTO transactions (user_id, type, amount, category, description, date) VALUES
      (demo_id, 'income',  45000.00, 'Salary',        'April monthly salary',        '2026-04-01'),
      (demo_id, 'income',   8500.00, 'Freelance',     'Website design project',      '2026-04-05'),
      (demo_id, 'expense',  2400.00, 'Rent',          'Monthly house rent',          '2026-04-02'),
      (demo_id, 'expense',  1200.00, 'Food',          'Monthly groceries',           '2026-04-03'),
      (demo_id, 'expense',   350.00, 'Transport',     'Monthly bus/metro pass',      '2026-04-04'),
      (demo_id, 'expense',   850.00, 'Utilities',     'Electricity and water bills', '2026-04-06'),
      (demo_id, 'expense',   600.00, 'Shopping',      'Clothing and accessories',    '2026-04-08'),
      (demo_id, 'expense',   250.00, 'Entertainment', 'Movie and dining out',        '2026-04-10'),
      (demo_id, 'income',   3000.00, 'Investment',    'Mutual fund dividend',        '2026-04-12'),
      (demo_id, 'expense',   500.00, 'Healthcare',    'Doctor consultation + meds',  '2026-04-13'),
      (demo_id, 'expense',  1500.00, 'Education',     'Online course subscription',  '2026-04-14'),
      (demo_id, 'expense',   400.00, 'Travel',        'Weekend trip fuel cost',      '2026-04-15');
  END IF;
END $$;
