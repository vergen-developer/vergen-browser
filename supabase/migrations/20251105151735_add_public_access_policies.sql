/*
  # Add Public Access Policies for Authentication

  1. Changes
    - Add policies to allow public registration (insert into users table)
    - Add policies to allow public login (select from users table)
    - Add policies to allow users to manage their own subscriptions
    
  2. Security
    - Users table: Allow public INSERT for registration, public SELECT for login
    - Subscriptions table: Allow INSERT for new users, allow users to read their own data
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public user registration" ON users;
DROP POLICY IF EXISTS "Allow public user login" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

DROP POLICY IF EXISTS "Allow subscription creation" ON subscriptions;
DROP POLICY IF EXISTS "Users can read own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

-- Users table policies
CREATE POLICY "Allow public user registration"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public user login"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Subscriptions table policies
CREATE POLICY "Allow subscription creation"
  ON subscriptions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());