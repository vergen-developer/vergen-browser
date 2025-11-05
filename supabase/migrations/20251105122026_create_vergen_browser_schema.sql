/*
  # VerGen Browser - Database Schema

  ## Overview
  Complete database schema for VerGen Browser proxy application with authentication,
  subscription management, proxy session tracking, and Stripe event logging.

  ## 1. New Tables

  ### users
  Core user authentication and profile table
  - `id` (uuid, primary key) - Unique user identifier
  - `username` (text, unique) - User's unique username for login
  - `email` (text) - Email address for recovery and notifications
  - `password_hash` (text) - Bcrypt hashed password
  - `created_at` (timestamptz) - Account creation timestamp
  - `last_login` (timestamptz) - Last successful login
  - `active` (boolean) - Account active status (default true)

  ### subscriptions
  Manages user subscription status and Stripe integration
  - `id` (uuid, primary key) - Subscription record identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `stripe_subscription_id` (text, unique) - Stripe subscription identifier
  - `stripe_customer_id` (text) - Stripe customer identifier
  - `status` (text) - Subscription status: active, expired, cancelled
  - `expires_at` (timestamptz) - Subscription expiration date
  - `created_at` (timestamptz) - Subscription creation date
  - `updated_at` (timestamptz) - Last update timestamp

  ### proxy_sessions
  Logs all proxy browsing sessions for history and analytics
  - `id` (uuid, primary key) - Session record identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `url_visited` (text) - Full URL accessed through proxy
  - `ip_location` (text) - Proxy location indicator (default: Canada 🇨🇦)
  - `timestamp` (timestamptz) - Session timestamp
  - `load_time_ms` (integer) - Page load time in milliseconds

  ### stripe_events
  Logs Stripe webhook events for debugging and auditing
  - `id` (uuid, primary key) - Event record identifier
  - `event_type` (text) - Stripe event type (e.g., customer.subscription.created)
  - `event_id` (text, unique) - Stripe event identifier for idempotency
  - `user_id` (uuid, foreign key) - Reference to users table (nullable)
  - `data` (jsonb) - Complete event payload from Stripe
  - `processed_at` (timestamptz) - Event processing timestamp

  ## 2. Security
  - Enable Row Level Security (RLS) on all tables
  - Users can only read/update their own data
  - Proxy sessions are user-scoped
  - Subscriptions are user-scoped
  - Stripe events are system-only access

  ## 3. Indexes
  - Indexed on user_id for fast lookups
  - Indexed on stripe_subscription_id and stripe_customer_id
  - Indexed on timestamp for proxy_sessions ordering
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text UNIQUE NOT NULL,
  email text,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  active boolean DEFAULT true
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text CHECK (status IN ('active', 'expired', 'cancelled')) DEFAULT 'expired',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create proxy_sessions table
CREATE TABLE IF NOT EXISTS proxy_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url_visited text NOT NULL,
  ip_location text DEFAULT 'Canada 🇨🇦',
  timestamp timestamptz DEFAULT now(),
  load_time_ms integer
);

-- Create stripe_events table
CREATE TABLE IF NOT EXISTS stripe_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type text,
  event_id text UNIQUE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  data jsonb,
  processed_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_proxy_sessions_user_id ON proxy_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_proxy_sessions_timestamp ON proxy_sessions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_events_user_id ON stripe_events(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proxy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for proxy_sessions table
CREATE POLICY "Users can view own proxy sessions"
  ON proxy_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own proxy sessions"
  ON proxy_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for stripe_events table (system only)
CREATE POLICY "Only system can access stripe events"
  ON stripe_events FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);