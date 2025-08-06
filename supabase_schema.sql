-- =====================================================
-- EYN Website - Supabase Database Schema
-- =====================================================
-- This file contains all the necessary database setup for the EYN website
-- Run this in your Supabase SQL Editor to set up the complete database schema

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
-- Stores additional user profile information beyond auth.users

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  username TEXT UNIQUE,
  display_name TEXT,
  location TEXT,
  timezone TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. USER ACTIVITY LOG
-- =====================================================
-- Tracks user activity and tool usage for analytics

CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  tool_name TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. PASSWORD HISTORY
-- =====================================================
-- Stores user's password generation history (encrypted)

CREATE TABLE IF NOT EXISTS password_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. FILE UPLOADS
-- =====================================================
-- Tracks user file uploads for tools like compression, conversion, etc.

CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  tool_used TEXT NOT NULL,
  processing_status TEXT DEFAULT 'pending',
  result_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 5. DOWNLOAD HISTORY
-- =====================================================
-- Tracks user downloads for analytics and rate limiting

CREATE TABLE IF NOT EXISTS download_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  download_type TEXT NOT NULL,
  file_count INTEGER DEFAULT 1,
  total_size BIGINT,
  source_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. USER SESSIONS
-- =====================================================
-- Extended session tracking for analytics

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- 7. TOOL USAGE STATISTICS
-- =====================================================
-- Aggregated statistics for each tool

CREATE TABLE IF NOT EXISTS tool_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name TEXT NOT NULL,
  usage_count BIGINT DEFAULT 0,
  unique_users BIGINT DEFAULT 0,
  total_processing_time BIGINT DEFAULT 0,
  success_count BIGINT DEFAULT 0,
  error_count BIGINT DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tool_name)
);

-- =====================================================
-- 8. API RATE LIMITING
-- =====================================================
-- Rate limiting table for API endpoints

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- =====================================================
-- 9. USER PREFERENCES
-- =====================================================
-- User-specific preferences for various tools

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_name)
);

-- =====================================================
-- 10. ERROR LOGS
-- =====================================================
-- Application error logging

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- User activity indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);

-- Password history indexes
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created_at ON password_history(created_at);

-- File uploads indexes
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_status ON file_uploads(processing_status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at);

-- Download history indexes
CREATE INDEX IF NOT EXISTS idx_download_history_user_id ON download_history(user_id);
CREATE INDEX IF NOT EXISTS idx_download_history_created_at ON download_history(created_at);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);

-- Rate limits indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint ON rate_limits(user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_tool ON user_preferences(user_id, tool_name);

-- Error logs indexes
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Note: tool_statistics table doesn't need RLS as it's for admin analytics

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- USER ACTIVITY POLICIES
-- =====================================================

-- Users can view their own activity
CREATE POLICY "Users can view their own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own activity
CREATE POLICY "Users can insert their own activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PASSWORD HISTORY POLICIES
-- =====================================================

-- Users can view their own password history
CREATE POLICY "Users can view their own password history" ON password_history
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own password history
CREATE POLICY "Users can insert their own password history" ON password_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own password history
CREATE POLICY "Users can delete their own password history" ON password_history
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FILE UPLOADS POLICIES
-- =====================================================

-- Users can view their own file uploads
CREATE POLICY "Users can view their own file uploads" ON file_uploads
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own file uploads
CREATE POLICY "Users can insert their own file uploads" ON file_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own file uploads
CREATE POLICY "Users can update their own file uploads" ON file_uploads
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own file uploads
CREATE POLICY "Users can delete their own file uploads" ON file_uploads
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- DOWNLOAD HISTORY POLICIES
-- =====================================================

-- Users can view their own download history
CREATE POLICY "Users can view their own download history" ON download_history
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own download history
CREATE POLICY "Users can insert their own download history" ON download_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- USER SESSIONS POLICIES
-- =====================================================

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- RATE LIMITS POLICIES
-- =====================================================

-- Users can view their own rate limits
CREATE POLICY "Users can view their own rate limits" ON rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own rate limits
CREATE POLICY "Users can insert their own rate limits" ON rate_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own rate limits
CREATE POLICY "Users can update their own rate limits" ON rate_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- USER PREFERENCES POLICIES
-- =====================================================

-- Users can view their own preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete their own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- ERROR LOGS POLICIES
-- =====================================================

-- Users can view their own error logs
CREATE POLICY "Users can view their own error logs" ON error_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own error logs
CREATE POLICY "Users can insert their own error logs" ON error_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old error logs
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM error_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old user activity
CREATE OR REPLACE FUNCTION cleanup_old_user_activity()
RETURNS void AS $$
BEGIN
  DELETE FROM user_activity 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old password history
CREATE OR REPLACE FUNCTION cleanup_old_password_history()
RETURNS void AS $$
BEGIN
  DELETE FROM password_history 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old file uploads
CREATE OR REPLACE FUNCTION cleanup_old_file_uploads()
RETURNS void AS $$
BEGIN
  DELETE FROM file_uploads 
  WHERE created_at < NOW() - INTERVAL '7 days' AND processing_status != 'pending';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Triggers to update updated_at timestamp
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_statistics_updated_at
  BEFORE UPDATE ON tool_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SCHEDULED JOBS (if using pg_cron extension)
-- =====================================================

-- Note: These require the pg_cron extension to be enabled in Supabase
-- You can enable it in the Supabase dashboard under Database > Extensions

-- Clean up old rate limits every hour
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT cleanup_old_rate_limits();');

-- Clean up old error logs daily at 2 AM
-- SELECT cron.schedule('cleanup-error-logs', '0 2 * * *', 'SELECT cleanup_old_error_logs();');

-- Clean up old user activity weekly on Sunday at 3 AM
-- SELECT cron.schedule('cleanup-user-activity', '0 3 * * 0', 'SELECT cleanup_old_user_activity();');

-- Clean up old password history daily at 4 AM
-- SELECT cron.schedule('cleanup-password-history', '0 4 * * *', 'SELECT cleanup_old_password_history();');

-- Clean up old file uploads daily at 5 AM
-- SELECT cron.schedule('cleanup-file-uploads', '0 5 * * *', 'SELECT cleanup_old_file_uploads();');

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert initial tool statistics
INSERT INTO tool_statistics (tool_name, usage_count, unique_users) VALUES
  ('password-generator', 0, 0),
  ('qr-generator', 0, 0),
  ('file-compressor', 0, 0),
  ('file-converter', 0, 0),
  ('bulk-downloader', 0, 0),
  ('color-tools', 0, 0),
  ('text-tools', 0, 0),
  ('hash-generator', 0, 0),
  ('base64-converter', 0, 0),
  ('url-encoder', 0, 0),
  ('json-formatter', 0, 0),
  ('markdown-editor', 0, 0),
  ('lorem-ipsum', 0, 0),
  ('word-counter', 0, 0)
ON CONFLICT (tool_name) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE profiles IS 'User profile information extending auth.users';
COMMENT ON TABLE user_activity IS 'Tracks user activity and tool usage for analytics';
COMMENT ON TABLE password_history IS 'Stores encrypted password generation history';
COMMENT ON TABLE file_uploads IS 'Tracks file uploads for processing tools';
COMMENT ON TABLE download_history IS 'Tracks user downloads for analytics';
COMMENT ON TABLE user_sessions IS 'Extended session tracking for analytics';
COMMENT ON TABLE tool_statistics IS 'Aggregated usage statistics for each tool';
COMMENT ON TABLE rate_limits IS 'Rate limiting data for API endpoints';
COMMENT ON TABLE user_preferences IS 'User-specific preferences for tools';
COMMENT ON TABLE error_logs IS 'Application error logging';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This completes the database schema setup for the EYN website
-- All tables, policies, functions, and triggers have been created
-- You can now use the database with your Next.js application 