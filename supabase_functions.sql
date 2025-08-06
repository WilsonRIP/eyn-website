-- =====================================================
-- Additional Database Functions for EYN Website
-- =====================================================
-- These functions support the database service operations

-- =====================================================
-- TOOL USAGE FUNCTIONS
-- =====================================================

-- Function to increment tool usage statistics
CREATE OR REPLACE FUNCTION increment_tool_usage(tool_name TEXT, processing_time BIGINT DEFAULT 0)
RETURNS void AS $$
BEGIN
  INSERT INTO tool_statistics (tool_name, usage_count, unique_users, total_processing_time, success_count, last_used)
  VALUES (tool_name, 1, 1, processing_time, 1, NOW())
  ON CONFLICT (tool_name) DO UPDATE SET
    usage_count = tool_statistics.usage_count + 1,
    total_processing_time = tool_statistics.total_processing_time + processing_time,
    success_count = tool_statistics.success_count + 1,
    last_used = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to increment rate limit counter
CREATE OR REPLACE FUNCTION increment_rate_limit(user_id UUID, endpoint TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO rate_limits (user_id, endpoint, request_count, window_start)
  VALUES (user_id, endpoint, 1, NOW())
  ON CONFLICT (user_id, endpoint, window_start) DO UPDATE SET
    request_count = rate_limits.request_count + 1,
    created_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS TABLE(
  total_activities BIGINT,
  total_downloads BIGINT,
  total_files BIGINT,
  total_passwords BIGINT,
  days_as_member INTEGER,
  last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ua.count, 0) as total_activities,
    COALESCE(dh.count, 0) as total_downloads,
    COALESCE(fu.count, 0) as total_files,
    COALESCE(ph.count, 0) as total_passwords,
    EXTRACT(DAY FROM NOW() - u.created_at)::INTEGER as days_as_member,
    COALESCE(ua.last_activity, u.created_at) as last_activity
  FROM auth.users u
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as count,
      MAX(created_at) as last_activity
    FROM user_activity 
    WHERE user_activity.user_id = get_user_stats.user_id
    GROUP BY user_id
  ) ua ON u.id = ua.user_id
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as count
    FROM download_history 
    WHERE download_history.user_id = get_user_stats.user_id
    GROUP BY user_id
  ) dh ON u.id = dh.user_id
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as count
    FROM file_uploads 
    WHERE file_uploads.user_id = get_user_stats.user_id
    GROUP BY user_id
  ) fu ON u.id = fu.user_id
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as count
    FROM password_history 
    WHERE password_history.user_id = get_user_stats.user_id
    GROUP BY user_id
  ) ph ON u.id = ph.user_id
  WHERE u.id = get_user_stats.user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get tool usage statistics for a user
CREATE OR REPLACE FUNCTION get_tool_usage_stats(user_id UUID)
RETURNS TABLE(
  tool_name TEXT,
  usage_count BIGINT,
  last_used TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.tool_name,
    COUNT(*) as usage_count,
    MAX(ua.created_at) as last_used
  FROM user_activity ua
  WHERE ua.user_id = get_tool_usage_stats.user_id
    AND ua.tool_name IS NOT NULL
  GROUP BY ua.tool_name
  ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CLEANUP FUNCTIONS
-- =====================================================

-- Function to clean up old sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions 
  SET 
    ended_at = NOW(),
    is_active = false
  WHERE 
    is_active = true 
    AND started_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to archive old data
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS void AS $$
BEGIN
  -- Archive old user activity (older than 1 year)
  DELETE FROM user_activity 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Archive old error logs (older than 6 months)
  DELETE FROM error_logs 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  -- Archive old file uploads (older than 30 days and not pending)
  DELETE FROM file_uploads 
  WHERE created_at < NOW() - INTERVAL '30 days' 
    AND processing_status != 'pending';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get user's most used tools
CREATE OR REPLACE FUNCTION get_user_top_tools(user_id UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
  tool_name TEXT,
  usage_count BIGINT,
  last_used TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.tool_name,
    COUNT(*) as usage_count,
    MAX(ua.created_at) as last_used
  FROM user_activity ua
  WHERE ua.user_id = get_user_top_tools.user_id
    AND ua.tool_name IS NOT NULL
  GROUP BY ua.tool_name
  ORDER BY usage_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent activity summary
CREATE OR REPLACE FUNCTION get_recent_activity_summary(user_id UUID, days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  activity_type TEXT,
  count BIGINT,
  last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.activity_type,
    COUNT(*) as count,
    MAX(ua.created_at) as last_activity
  FROM user_activity ua
  WHERE ua.user_id = get_recent_activity_summary.user_id
    AND ua.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY ua.activity_type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has exceeded rate limits
CREATE OR REPLACE FUNCTION check_user_rate_limits(user_id UUID, endpoint TEXT, max_requests INTEGER DEFAULT 100, window_minutes INTEGER DEFAULT 60)
RETURNS TABLE(
  is_allowed BOOLEAN,
  remaining_requests INTEGER,
  reset_time TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := NOW() - (window_minutes || ' minutes')::INTERVAL;
  
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM rate_limits
  WHERE rate_limits.user_id = check_user_rate_limits.user_id
    AND rate_limits.endpoint = check_user_rate_limits.endpoint
    AND rate_limits.window_start >= window_start;
  
  RETURN QUERY
  SELECT 
    current_count < max_requests as is_allowed,
    GREATEST(0, max_requests - current_count) as remaining_requests,
    window_start + (window_minutes || ' minutes')::INTERVAL as reset_time;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- NOTIFICATION FUNCTIONS
-- =====================================================

-- Function to get user's activity summary for notifications
CREATE OR REPLACE FUNCTION get_user_activity_summary(user_id UUID)
RETURNS TABLE(
  total_today BIGINT,
  total_week BIGINT,
  total_month BIGINT,
  most_used_tool TEXT,
  last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  WITH activity_summary AS (
    SELECT 
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_count,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_count,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as month_count,
      MAX(created_at) as last_activity
    FROM user_activity
    WHERE user_activity.user_id = get_user_activity_summary.user_id
  ),
  top_tool AS (
    SELECT tool_name
    FROM user_activity
    WHERE user_activity.user_id = get_user_activity_summary.user_id
      AND tool_name IS NOT NULL
    GROUP BY tool_name
    ORDER BY COUNT(*) DESC
    LIMIT 1
  )
  SELECT 
    COALESCE(act_summary.today_count, 0) as total_today,
    COALESCE(act_summary.week_count, 0) as total_week,
    COALESCE(act_summary.month_count, 0) as total_month,
    tt.tool_name as most_used_tool,
    COALESCE(act_summary.last_activity, NOW()) as last_activity
  FROM activity_summary act_summary
  LEFT JOIN top_tool tt ON true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECURITY FUNCTIONS
-- =====================================================

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  user_id UUID,
  event_type TEXT,
  event_details JSONB DEFAULT '{}',
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO error_logs (
    user_id,
    error_type,
    error_message,
    context,
    ip_address,
    user_agent
  ) VALUES (
    user_id,
    'security_event',
    event_type,
    event_details,
    ip_address,
    user_agent
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check for suspicious activity
CREATE OR REPLACE FUNCTION check_suspicious_activity(user_id UUID, time_window_minutes INTEGER DEFAULT 60)
RETURNS TABLE(
  is_suspicious BOOLEAN,
  reason TEXT,
  activity_count BIGINT
) AS $$
DECLARE
  recent_activity_count BIGINT;
  failed_attempts BIGINT;
BEGIN
  -- Count recent activity
  SELECT COUNT(*) INTO recent_activity_count
  FROM user_activity
  WHERE user_activity.user_id = check_suspicious_activity.user_id
    AND created_at >= NOW() - (time_window_minutes || ' minutes')::INTERVAL;
  
  -- Count failed attempts
  SELECT COUNT(*) INTO failed_attempts
  FROM error_logs
  WHERE error_logs.user_id = check_suspicious_activity.user_id
    AND error_type = 'security_event'
    AND error_message LIKE '%failed%'
    AND created_at >= NOW() - (time_window_minutes || ' minutes')::INTERVAL;
  
  -- Determine if activity is suspicious
  IF recent_activity_count > 100 THEN
    RETURN QUERY SELECT true, 'High activity volume', recent_activity_count;
  ELSIF failed_attempts > 10 THEN
    RETURN QUERY SELECT true, 'Multiple failed attempts', failed_attempts;
  ELSE
    RETURN QUERY SELECT false, 'Normal activity', recent_activity_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERFORMANCE FUNCTIONS
-- =====================================================

-- Function to get database performance metrics
CREATE OR REPLACE FUNCTION get_performance_metrics()
RETURNS TABLE(
  table_name TEXT,
  row_count BIGINT,
  last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'profiles'::TEXT as table_name,
    COUNT(*) as row_count,
    MAX(updated_at) as last_updated
  FROM profiles
  UNION ALL
  SELECT 
    'user_activity'::TEXT,
    COUNT(*) as row_count,
    MAX(created_at) as last_updated
  FROM user_activity
  UNION ALL
  SELECT 
    'password_history'::TEXT,
    COUNT(*) as row_count,
    MAX(created_at) as last_updated
  FROM password_history
  UNION ALL
  SELECT 
    'file_uploads'::TEXT,
    COUNT(*) as row_count,
    MAX(created_at) as last_updated
  FROM file_uploads
  UNION ALL
  SELECT 
    'download_history'::TEXT,
    COUNT(*) as row_count,
    MAX(created_at) as last_updated
  FROM download_history;
END;
$$ LANGUAGE plpgsql;

-- Function to optimize database tables
CREATE OR REPLACE FUNCTION optimize_tables()
RETURNS void AS $$
BEGIN
  -- This is a placeholder for table optimization
  -- In a real implementation, you might run VACUUM, ANALYZE, or REINDEX
  -- For now, we'll just log that optimization was requested
  INSERT INTO error_logs (error_type, error_message, context)
  VALUES ('system_event', 'Table optimization requested', '{"timestamp": "' || NOW() || '"}');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- These functions complete the database functionality for the EYN website
-- All functions are now available for use by the database service 