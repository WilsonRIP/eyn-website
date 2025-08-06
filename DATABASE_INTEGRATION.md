# Database Integration Guide

## Overview

The EYN website now has full database integration with Supabase, providing persistent data storage, user management, and analytics capabilities.

## Database Structure

### Tables Created

1. **`profiles`** - Extended user profile information
2. **`user_activity`** - Activity tracking and analytics
3. **`password_history`** - Encrypted password generation history
4. **`file_uploads`** - File processing tracking
5. **`download_history`** - Download analytics
6. **`user_sessions`** - Extended session tracking
7. **`tool_statistics`** - Aggregated tool usage stats
8. **`rate_limits`** - API rate limiting
9. **`user_preferences`** - User-specific tool preferences
10. **`error_logs`** - Application error logging

### Security Features

- ✅ Row Level Security (RLS) enabled on all user tables
- ✅ Comprehensive policies for data access control
- ✅ Automatic profile creation on user signup
- ✅ Encrypted password history storage
- ✅ Rate limiting support
- ✅ Comprehensive audit trails

## Setup Instructions

### 1. Run Database Schema

Execute these SQL files in your Supabase SQL Editor:

1. **First**: Run `supabase_schema.sql` to create all tables, policies, and basic functions
2. **Then**: Run `supabase_functions.sql` to add additional database functions

### 2. File Structure

The Supabase integration has been split into client and server concerns:

```
src/lib/
├── supabase.ts              # Main re-export file
├── supabase-client.ts       # Client-side operations only
├── supabase-server.ts       # Server-side operations only
└── database-service.ts      # Comprehensive database service
```

### 3. Usage Examples

#### Client-Side Usage

```typescript
import { databaseService } from '@/src/lib/database-service';

// Get user profile
const { data: profile, error } = await databaseService.getProfile(userId);

// Log activity
await databaseService.logActivity({
  user_id: userId,
  activity_type: 'tool_used',
  tool_name: 'password-generator'
});

// Save user preferences
await databaseService.saveUserPreferences(userId, 'password-generator', {
  length: 16,
  includeSymbols: true
});
```

#### Server-Side Usage

```typescript
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

// In a Server Component or API Route
const supabase = await createServerSupabaseClient();
const { data, error } = await supabase.from('profiles').select('*');
```

## Features Implemented

### Profile Management
- Extended user profiles with additional fields
- Profile editing and updates
- Activity tracking and history
- User preferences storage

### Activity Tracking
- Automatic logging of tool usage
- User activity history
- Tool-specific analytics
- Download and file processing tracking

### Password Generator
- Secure password history storage
- User preference persistence
- Activity logging
- Tool usage statistics

### Dashboard Analytics
- Real-time user statistics
- Tool usage analytics
- Recent activity feeds
- Popular tools tracking

### Security & Performance
- Rate limiting for API protection
- Error logging and monitoring
- Session tracking
- Data cleanup functions

## Database Functions

### Analytics Functions
- `get_user_stats()` - Get comprehensive user statistics
- `get_tool_usage_stats()` - Get tool usage for a user
- `get_user_top_tools()` - Get user's most used tools
- `get_recent_activity_summary()` - Get recent activity summary

### Utility Functions
- `increment_tool_usage()` - Track tool usage
- `increment_rate_limit()` - Handle rate limiting
- `check_user_rate_limits()` - Check rate limit status
- `get_user_activity_summary()` - Get activity summary for notifications

### Cleanup Functions
- `cleanup_old_sessions()` - Clean up expired sessions
- `archive_old_data()` - Archive old data
- `cleanup_old_rate_limits()` - Clean up old rate limits
- `cleanup_old_error_logs()` - Clean up old error logs

## Environment Variables

Make sure you have these environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Common Issues

1. **"next/headers" error**: Make sure you're using the correct import:
   - Use `supabase-client.ts` for client components
   - Use `supabase-server.ts` for server components

2. **RLS Policy errors**: Ensure all tables have proper RLS policies enabled

3. **Function not found**: Make sure you've run both SQL files in the correct order

4. **Authentication issues**: Verify your Supabase project settings and environment variables

### Performance Tips

- Use the database service singleton for consistent connections
- Implement proper error handling for all database operations
- Use the cleanup functions to maintain database performance
- Monitor rate limits to prevent abuse

## Migration Notes

- All existing functionality remains intact
- New features are additive and don't break existing code
- LocalStorage fallbacks are provided for non-authenticated users
- Backward compatibility is maintained for existing imports

## Next Steps

1. **Monitor Usage**: Check the analytics dashboard for tool usage patterns
2. **Optimize Performance**: Use the performance monitoring functions
3. **Add Features**: Extend the database schema for new features
4. **Security Review**: Regularly review RLS policies and security settings 