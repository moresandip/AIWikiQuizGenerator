/*
  # Create Quiz Storage Tables

  1. New Tables
    - `quizzes`
      - `id` (uuid, primary key)
      - `url` (text, unique)
      - `title` (text)
      - `summary` (text)
      - `scraped_content` (text)
      - `quiz_data` (jsonb - questions with options, answers, explanations)
      - `key_entities` (jsonb - people, organizations, locations)
      - `sections` (text array)
      - `related_topics` (text array)
      - `date_generated` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `quizzes` table
    - Allow public read access (no auth required)
    - Allow anyone to insert new quizzes
*/

CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text UNIQUE NOT NULL,
  title text NOT NULL,
  summary text,
  scraped_content text,
  quiz_data jsonb NOT NULL,
  key_entities jsonb,
  sections text[] DEFAULT '{}',
  related_topics text[] DEFAULT '{}',
  date_generated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quizzes"
  ON quizzes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert quizzes"
  ON quizzes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
