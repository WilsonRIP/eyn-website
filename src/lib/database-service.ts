// src/lib/database-service.ts
import { createBrowserSupabaseClient, supabase } from './supabase-client';

// Types for database operations
export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  bio?: string;
  username?: string;
  display_name?: string;
  location?: string;
  timezone?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  tool_name?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PasswordHistory {
  id: string;
  user_id: string;
  password_hash: string;
  settings: Record<string, any>;
  created_at: string;
}

export interface FileUpload {
  id: string;
  user_id: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  tool_used: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  result_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  processed_at?: string;
}

export interface DownloadHistory {
  id: string;
  user_id: string;
  download_type: string;
  file_count: number;
  total_size?: number;
  source_urls?: string[];
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  device_info?: Record<string, any>;
  started_at: string;
  ended_at?: string;
  is_active: boolean;
}

export interface ToolStatistics {
  id: string;
  tool_name: string;
  usage_count: number;
  unique_users: number;
  total_processing_time: number;
  success_count: number;
  error_count: number;
  last_used?: string;
  created_at: string;
  updated_at: string;
}

export interface RateLimit {
  id: string;
  user_id: string;
  endpoint: string;
  request_count: number;
  window_start: string;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  tool_name: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ErrorLog {
  id: string;
  user_id?: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  context?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Database service class
export class DatabaseService {
  private static instance: DatabaseService;
  private supabase: any;

  constructor() {
    // Use browser client for client-side operations
    this.supabase = supabase;
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Set supabase client (for server-side operations)
  setSupabaseClient(client: any) {
    this.supabase = client;
  }

  // =====================================================
  // PROFILE OPERATIONS
  // =====================================================

  async getProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: any }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  }

  async createProfile(profile: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: any }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single();
    return { data, error };
  }

  // =====================================================
  // USER ACTIVITY OPERATIONS
  // =====================================================

  async logActivity(activity: Omit<UserActivity, 'id' | 'created_at'>): Promise<{ data: UserActivity | null; error: any }> {
    const { data, error } = await this.supabase
      .from('user_activity')
      .insert(activity)
      .select()
      .single();
    return { data, error };
  }

  async getUserActivity(userId: string, limit = 50): Promise<{ data: UserActivity[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  async getActivityByTool(userId: string, toolName: string, limit = 20): Promise<{ data: UserActivity[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_name', toolName)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  // =====================================================
  // PASSWORD HISTORY OPERATIONS
  // =====================================================

  async savePasswordHistory(history: Omit<PasswordHistory, 'id' | 'created_at'>): Promise<{ data: PasswordHistory | null; error: any }> {
    const { data, error } = await this.supabase
      .from('password_history')
      .insert(history)
      .select()
      .single();
    return { data, error };
  }

  async getPasswordHistory(userId: string, limit = 20): Promise<{ data: PasswordHistory[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('password_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  async deletePasswordHistory(userId: string, historyId: string): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('password_history')
      .delete()
      .eq('id', historyId)
      .eq('user_id', userId);
    return { error };
  }

  async clearPasswordHistory(userId: string): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('password_history')
      .delete()
      .eq('user_id', userId);
    return { error };
  }

  // =====================================================
  // FILE UPLOAD OPERATIONS
  // =====================================================

  async createFileUpload(upload: Omit<FileUpload, 'id' | 'created_at'>): Promise<{ data: FileUpload | null; error: any }> {
    const { data, error } = await this.supabase
      .from('file_uploads')
      .insert(upload)
      .select()
      .single();
    return { data, error };
  }

  async updateFileUpload(uploadId: string, userId: string, updates: Partial<FileUpload>): Promise<{ data: FileUpload | null; error: any }> {
    const { data, error } = await this.supabase
      .from('file_uploads')
      .update(updates)
      .eq('id', uploadId)
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  }

  async getFileUploads(userId: string, limit = 20): Promise<{ data: FileUpload[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('file_uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  async deleteFileUpload(uploadId: string, userId: string): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('file_uploads')
      .delete()
      .eq('id', uploadId)
      .eq('user_id', userId);
    return { error };
  }

  // =====================================================
  // DOWNLOAD HISTORY OPERATIONS
  // =====================================================

  async logDownload(download: Omit<DownloadHistory, 'id' | 'created_at'>): Promise<{ data: DownloadHistory | null; error: any }> {
    const { data, error } = await this.supabase
      .from('download_history')
      .insert(download)
      .select()
      .single();
    return { data, error };
  }

  async getDownloadHistory(userId: string, limit = 20): Promise<{ data: DownloadHistory[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('download_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  // =====================================================
  // USER SESSION OPERATIONS
  // =====================================================

  async createSession(session: Omit<UserSession, 'id' | 'started_at'>): Promise<{ data: UserSession | null; error: any }> {
    const { data, error } = await this.supabase
      .from('user_sessions')
      .insert(session)
      .select()
      .single();
    return { data, error };
  }

  async endSession(sessionId: string, userId: string): Promise<{ error: any }> {
    const { error } = await this.supabase
      .from('user_sessions')
      .update({ 
        ended_at: new Date().toISOString(),
        is_active: false 
      })
      .eq('session_id', sessionId)
      .eq('user_id', userId);
    return { error };
  }

  async getActiveSessions(userId: string): Promise<{ data: UserSession[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('started_at', { ascending: false });
    return { data, error };
  }

  // =====================================================
  // TOOL STATISTICS OPERATIONS
  // =====================================================

  async incrementToolUsage(toolName: string, processingTime?: number): Promise<{ error: any }> {
    const { error } = await this.supabase.rpc('increment_tool_usage', {
      tool_name: toolName,
      processing_time: processingTime || 0
    });
    return { error };
  }

  async getToolStatistics(toolName?: string): Promise<{ data: ToolStatistics[] | null; error: any }> {
    let query = this.supabase
      .from('tool_statistics')
      .select('*')
      .order('usage_count', { ascending: false });

    if (toolName) {
      query = query.eq('tool_name', toolName);
    }

    const { data, error } = await query;
    return { data, error };
  }

  // =====================================================
  // RATE LIMITING OPERATIONS
  // =====================================================

  async checkRateLimit(userId: string, endpoint: string, limit: number, windowMinutes: number = 60): Promise<{ allowed: boolean; remaining: number; error: any }> {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
    
    const { data, error } = await this.supabase
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      return { allowed: false, remaining: 0, error };
    }

    const currentCount = data?.request_count || 0;
    const remaining = Math.max(0, limit - currentCount);
    const allowed = currentCount < limit;

    return { allowed, remaining, error: null };
  }

  async incrementRateLimit(userId: string, endpoint: string): Promise<{ error: any }> {
    const { error } = await this.supabase.rpc('increment_rate_limit', {
      user_id: userId,
      endpoint: endpoint
    });
    return { error };
  }

  // =====================================================
  // USER PREFERENCES OPERATIONS
  // =====================================================

  async getUserPreferences(userId: string, toolName: string): Promise<{ data: UserPreferences | null; error: any }> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_name', toolName)
      .single();
    return { data, error };
  }

  async saveUserPreferences(userId: string, toolName: string, preferences: Record<string, any>): Promise<{ data: UserPreferences | null; error: any }> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        tool_name: toolName,
        preferences
      })
      .select()
      .single();
    return { data, error };
  }

  async getAllUserPreferences(userId: string): Promise<{ data: UserPreferences[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  }

  // =====================================================
  // ERROR LOGGING OPERATIONS
  // =====================================================

  async logError(error: Omit<ErrorLog, 'id' | 'created_at'>): Promise<{ data: ErrorLog | null; error: any }> {
    const { data, error: dbError } = await this.supabase
      .from('error_logs')
      .insert(error)
      .select()
      .single();
    return { data, error: dbError };
  }

  async getUserErrors(userId: string, limit = 50): Promise<{ data: ErrorLog[] | null; error: any }> {
    const { data, error } = await this.supabase
      .from('error_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  // =====================================================
  // ANALYTICS OPERATIONS
  // =====================================================

  async getUserStats(userId: string): Promise<{ data: any; error: any }> {
    const { data, error } = await this.supabase.rpc('get_user_stats', {
      user_id: userId
    });
    return { data, error };
  }

  async getToolUsageStats(userId: string): Promise<{ data: any; error: any }> {
    const { data, error } = await this.supabase.rpc('get_tool_usage_stats', {
      user_id: userId
    });
    return { data, error };
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  async getUserData(userId: string): Promise<{
    profile: UserProfile | null;
    activity: UserActivity[] | null;
    passwordHistory: PasswordHistory[] | null;
    fileUploads: FileUpload[] | null;
    downloadHistory: DownloadHistory[] | null;
    preferences: UserPreferences[] | null;
    error: any;
  }> {
    const [
      profileResult,
      activityResult,
      passwordHistoryResult,
      fileUploadsResult,
      downloadHistoryResult,
      preferencesResult
    ] = await Promise.all([
      this.getProfile(userId),
      this.getUserActivity(userId, 10),
      this.getPasswordHistory(userId, 10),
      this.getFileUploads(userId, 10),
      this.getDownloadHistory(userId, 10),
      this.getAllUserPreferences(userId)
    ]);

    return {
      profile: profileResult.data,
      activity: activityResult.data,
      passwordHistory: passwordHistoryResult.data,
      fileUploads: fileUploadsResult.data,
      downloadHistory: downloadHistoryResult.data,
      preferences: preferencesResult.data,
      error: profileResult.error || activityResult.error || passwordHistoryResult.error || 
             fileUploadsResult.error || downloadHistoryResult.error || preferencesResult.error
    };
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();

// Export helper functions for backward compatibility
export const {
  getProfile,
  updateProfile,
  createProfile,
  logActivity,
  getUserActivity,
  savePasswordHistory,
  getPasswordHistory,
  createFileUpload,
  updateFileUpload,
  getFileUploads,
  logDownload,
  getDownloadHistory,
  createSession,
  endSession,
  incrementToolUsage,
  getToolStatistics,
  checkRateLimit,
  incrementRateLimit,
  getUserPreferences,
  saveUserPreferences,
  logError,
  getUserStats,
  getUserData
} = databaseService; 