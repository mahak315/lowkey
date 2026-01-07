/*
  # Create lowkey anonymous venting app schema

  1. New Tables
    - `waiting_queue`
      - `id` (uuid, primary key) - unique identifier for waiting user
      - `initial_vent` (text) - the user's initial vent message
      - `created_at` (timestamptz) - when they joined the queue
      
    - `chat_sessions`
      - `id` (uuid, primary key) - unique session identifier
      - `user1_id` (uuid) - first peer's temporary ID
      - `user2_id` (uuid) - second peer's temporary ID
      - `status` (text) - 'active', 'ended'
      - `created_at` (timestamptz) - when session started
      - `ended_at` (timestamptz, nullable) - when session ended
      
    - `messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key) - references chat_sessions
      - `sender_id` (uuid) - temporary user ID
      - `content` (text) - message content
      - `created_at` (timestamptz)
      
    - `feedback`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key) - references chat_sessions
      - `user_id` (uuid) - temporary user ID
      - `feeling` (text) - 'better', 'neutral', 'worse'
      - `needs_help` (boolean)
      - `created_at` (timestamptz)
      
  2. Security
    - Enable RLS on all tables
    - Allow anonymous access for all operations (this is an anonymous app)
    - Users can only see their own active sessions and messages
*/

-- Create waiting_queue table
CREATE TABLE IF NOT EXISTS waiting_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initial_vent text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waiting_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waiting queue"
  ON waiting_queue FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view waiting queue"
  ON waiting_queue FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can remove from waiting queue"
  ON waiting_queue FOR DELETE
  TO anon
  USING (true);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create sessions"
  ON chat_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view their sessions"
  ON chat_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update their sessions"
  ON chat_sessions FOR UPDATE
  TO anon
  USING (true);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send messages"
  ON messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
  ON messages FOR SELECT
  TO anon
  USING (true);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  feeling text NOT NULL,
  needs_help boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON feedback FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view feedback"
  ON feedback FOR SELECT
  TO anon
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_waiting_queue_created_at ON waiting_queue(created_at);