/*
  # Financial Chatbot Database Schema

  1. New Tables
    - `transcript_chunks` - Stores processed transcript chunks with vector embeddings
    - `stock_prices` - Stores historical stock price data
    - `user_queries` - Logs user queries and responses for history

  2. Extensions
    - Enable pgvector extension for vector similarity search

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Table to store transcript chunks
CREATE TABLE IF NOT EXISTS transcript_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  embedding vector(1536),  -- DeepSeek embedding size
  quarter text,
  source_file text,
  created_at timestamptz DEFAULT now()
);

-- Table to store parsed stock prices
CREATE TABLE IF NOT EXISTS stock_prices (
  date date PRIMARY KEY,
  open numeric,
  high numeric,
  low numeric,
  close numeric,
  created_at timestamptz DEFAULT now()
);

-- Table to log user queries and answers
CREATE TABLE IF NOT EXISTS user_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  answer text,
  query_type text,  -- 'stock', 'transcript', 'both'
  sources jsonb,    -- Store source information
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transcript_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allowing public access for this demo)
CREATE POLICY "Allow all operations on transcript_chunks"
  ON transcript_chunks
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on stock_prices"
  ON stock_prices
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on user_queries"
  ON user_queries
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS transcript_chunks_embedding_idx ON transcript_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS stock_prices_date_idx ON stock_prices (date);
CREATE INDEX IF NOT EXISTS user_queries_created_at_idx ON user_queries (created_at DESC);