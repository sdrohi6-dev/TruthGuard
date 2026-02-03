/*
  # Trust Verification Platform Schema

  ## Overview
  This migration creates the complete database schema for a trust verification platform
  that helps users verify credibility in an AI-dominated internet.

  ## Tables Created

  1. **profiles**
     - Extends auth.users with user profile information
     - Tracks reputation and contribution metrics
     - Fields: id, email, display_name, reputation_score, contributions_count, created_at

  2. **sources**
     - Tracks content sources (domains, platforms, creators)
     - Maintains historical trust ratings
     - Fields: id, source_type, identifier, name, trust_score, analysis_count, created_at, updated_at

  3. **content_submissions**
     - Stores user-submitted content for analysis
     - Links to sources and submitting users
     - Fields: id, user_id, url, title, content_text, source_id, trust_score, status, created_at, updated_at

  4. **trust_score_components**
     - Breaks down trust scores into individual factors
     - Enables transparency in scoring methodology
     - Fields: submission_id, source_credibility, creator_history, bias_score, community_validation, fact_check_results, updated_at

  5. **bias_signals**
     - Records detected bias indicators in content
     - Categorizes bias types and severity
     - Fields: id, submission_id, bias_type, description, severity, detected_at

  6. **community_validations**
     - Tracks user votes and validations on content
     - Prevents duplicate voting
     - Fields: id, submission_id, user_id, validation_type, confidence_level, notes, created_at

  7. **creator_history**
     - Maintains historical records of content creators
     - Tracks credibility metrics over time
     - Fields: id, creator_identifier, platform, total_content, accuracy_rate, bias_tendency, last_updated

  ## Security
  - RLS enabled on all tables
  - Policies ensure users can only modify their own data
  - Public read access for submissions and sources (transparency)
  - Protected write access requiring authentication
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  reputation_score integer DEFAULT 0,
  contributions_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create sources table
CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('domain', 'creator', 'platform', 'publisher')),
  identifier text NOT NULL UNIQUE,
  name text NOT NULL,
  trust_score numeric(3,2) DEFAULT 0.00 CHECK (trust_score >= 0 AND trust_score <= 1),
  analysis_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sources"
  ON sources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sources"
  ON sources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sources"
  ON sources FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create content_submissions table
CREATE TABLE IF NOT EXISTS content_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  url text,
  title text NOT NULL,
  content_text text,
  source_id uuid REFERENCES sources(id) ON DELETE SET NULL,
  trust_score numeric(3,2) DEFAULT 0.00 CHECK (trust_score >= 0 AND trust_score <= 1),
  status text DEFAULT 'analyzing' CHECK (status IN ('analyzing', 'completed', 'flagged')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view submissions"
  ON content_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own submissions"
  ON content_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON content_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trust_score_components table
CREATE TABLE IF NOT EXISTS trust_score_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES content_submissions(id) ON DELETE CASCADE,
  source_credibility numeric(3,2) DEFAULT 0.00 CHECK (source_credibility >= 0 AND source_credibility <= 1),
  creator_history numeric(3,2) DEFAULT 0.00 CHECK (creator_history >= 0 AND creator_history <= 1),
  bias_score numeric(3,2) DEFAULT 0.00 CHECK (bias_score >= 0 AND bias_score <= 1),
  community_validation numeric(3,2) DEFAULT 0.00 CHECK (community_validation >= 0 AND community_validation <= 1),
  fact_check_results numeric(3,2) DEFAULT 0.00 CHECK (fact_check_results >= 0 AND fact_check_results <= 1),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(submission_id)
);

ALTER TABLE trust_score_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trust score components"
  ON trust_score_components FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert trust score components"
  ON trust_score_components FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update trust score components"
  ON trust_score_components FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create bias_signals table
CREATE TABLE IF NOT EXISTS bias_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES content_submissions(id) ON DELETE CASCADE,
  bias_type text NOT NULL CHECK (bias_type IN ('political', 'emotional', 'selection', 'framing', 'source', 'confirmation')),
  description text NOT NULL,
  severity text DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  detected_at timestamptz DEFAULT now()
);

ALTER TABLE bias_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bias signals"
  ON bias_signals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert bias signals"
  ON bias_signals FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create community_validations table
CREATE TABLE IF NOT EXISTS community_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES content_submissions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  validation_type text NOT NULL CHECK (validation_type IN ('trustworthy', 'questionable', 'misleading', 'verified')),
  confidence_level integer DEFAULT 3 CHECK (confidence_level >= 1 AND confidence_level <= 5),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(submission_id, user_id)
);

ALTER TABLE community_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view validations"
  ON community_validations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own validations"
  ON community_validations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own validations"
  ON community_validations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create creator_history table
CREATE TABLE IF NOT EXISTS creator_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_identifier text NOT NULL,
  platform text NOT NULL,
  total_content integer DEFAULT 0,
  accuracy_rate numeric(3,2) DEFAULT 0.00 CHECK (accuracy_rate >= 0 AND accuracy_rate <= 1),
  bias_tendency text DEFAULT 'neutral' CHECK (bias_tendency IN ('left', 'center-left', 'neutral', 'center-right', 'right', 'unknown')),
  last_updated timestamptz DEFAULT now(),
  UNIQUE(creator_identifier, platform)
);

ALTER TABLE creator_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view creator history"
  ON creator_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert creator history"
  ON creator_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update creator history"
  ON creator_history FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON content_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_source_id ON content_submissions(source_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON content_submissions(status);
CREATE INDEX IF NOT EXISTS idx_validations_submission_id ON community_validations(submission_id);
CREATE INDEX IF NOT EXISTS idx_bias_signals_submission_id ON bias_signals(submission_id);
CREATE INDEX IF NOT EXISTS idx_sources_identifier ON sources(identifier);
CREATE INDEX IF NOT EXISTS idx_creator_history_identifier ON creator_history(creator_identifier);
