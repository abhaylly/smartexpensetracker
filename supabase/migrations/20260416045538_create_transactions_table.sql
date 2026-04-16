/*
  # Create transactions table

  ## Summary
  Creates the transactions table to store all income and expense records for users.

  ## New Tables

  ### `transactions`
  - `id` (uuid, primary key) - Unique identifier for each transaction
  - `user_id` (uuid, foreign key -> users.id) - Owner of the transaction
  - `type` (text, not null) - Either 'income' or 'expense' (enforced by CHECK constraint)
  - `amount` (numeric 12,2, not null) - Monetary amount, must be positive
  - `category` (text, not null) - Category label (e.g., Food, Travel, Salary)
  - `description` (text, nullable) - Optional notes about the transaction
  - `date` (date, not null) - Date the transaction occurred
  - `created_at` (timestamptz) - When the record was created

  ## Security
  - RLS enabled on `transactions` table
  - Users can only SELECT, INSERT, UPDATE, DELETE their own transactions
  - All policies check user_id = auth.uid() for data isolation

  ## Notes
  1. ON DELETE CASCADE means deleting a user removes all their transactions
  2. Indexes on user_id and date optimize the most common query patterns
  3. The CHECK on type prevents invalid data at the database level
  4. amount > 0 constraint ensures no zero or negative transactions
*/

CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category    TEXT NOT NULL,
  description TEXT DEFAULT '',
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date    ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type    ON transactions(type);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
