/*
  # Create users table

  ## Summary
  Creates the core users table for the Smart Expense Tracker application.

  ## New Tables

  ### `users`
  - `id` (uuid, primary key) - Unique identifier for each user
  - `email` (text, unique, not null) - User's email address used for login
  - `password` (text, not null) - bcrypt-hashed password (never stored in plaintext)
  - `name` (text, not null) - User's display name
  - `created_at` (timestamptz) - Account creation timestamp

  ## Security
  - RLS enabled on `users` table
  - Users can only read and update their own profile
  - Insert policy allows new user registration
  - No policy for delete (accounts cannot be deleted via API)

  ## Notes
  1. Passwords are stored as bcrypt hashes - the backend handles hashing before insert
  2. Email uniqueness is enforced at the database level
  3. This table is the parent in the users -> transactions foreign key relationship
*/

CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow insert for registration"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
