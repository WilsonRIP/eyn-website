"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Label } from "@/src/app/components/ui/label";
import { Textarea } from "@/src/app/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/app/components/ui/avatar";
import { Badge } from "@/src/app/components/ui/badge";
import { Separator } from "@/src/app/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/app/components/ui/tabs";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Save, 
  Edit, 
  Globe, 
  MapPin, 
  Clock,
  Activity,
  Download,
  FileText,
  Key,
  Settings,
  Loader2
} from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { databaseService, UserProfile, UserActivity, PasswordHistory, FileUpload, DownloadHistory } from "@/src/lib/database-service";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { user, updatePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Profile data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    username: "",
    display_name: "",
    website: "",
    bio: "",
    location: "",
    timezone: ""
  });

  // Activity data
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([]);
  const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([]);
  const [stats, setStats] = useState({
    totalActivity: 0,
    totalDownloads: 0,
    totalFiles: 0,
    totalPasswords: 0
  });

  // Load user data on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setProfileLoading(true);
    try {
      const userData = await databaseService.getUserData(user.id);
      
      if (userData.error) {
        console.error('Error loading user data:', userData.error);
        toast.error('Failed to load profile data');
        return;
      }

      setProfile(userData.profile);
      setRecentActivity(userData.activity || []);
      setPasswordHistory(userData.passwordHistory || []);
      setFileUploads(userData.fileUploads || []);
      setDownloadHistory(userData.downloadHistory || []);

      // Update form with profile data
      if (userData.profile) {
        setProfileForm({
          full_name: userData.profile.full_name || "",
          username: userData.profile.username || "",
          display_name: userData.profile.display_name || "",
          website: userData.profile.website || "",
          bio: userData.profile.bio || "",
          location: userData.profile.location || "",
          timezone: userData.profile.timezone || ""
        });
      }

      // Calculate stats
      setStats({
        totalActivity: userData.activity?.length || 0,
        totalDownloads: userData.downloadHistory?.length || 0,
        totalFiles: userData.fileUploads?.length || 0,
        totalPasswords: userData.passwordHistory?.length || 0
      });

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await databaseService.updateProfile(user.id, profileForm);
      
      if (error) {
        toast.error('Failed to update profile');
        return;
      }

      setProfile(data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
      
      // Log activity
      await databaseService.logActivity({
        user_id: user.id,
        activity_type: 'profile_updated',
        tool_name: 'profile',
        metadata: { updated_fields: Object.keys(profileForm).filter(key => profileForm[key as keyof typeof profileForm]) }
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        toast.error(error.message);
        return;
      }

      setNewPassword("");
      setConfirmPassword("");
      toast.success('Password updated successfully');
      
      // Log activity
      await databaseService.logActivity({
        user_id: user.id,
        activity_type: 'password_changed',
        tool_name: 'profile'
      });

    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const clearPasswordHistory = async () => {
    if (!user) return;
    
    try {
      const { error } = await databaseService.clearPasswordHistory(user.id);
      
      if (error) {
        toast.error('Failed to clear password history');
        return;
      }

      setPasswordHistory([]);
      toast.success('Password history cleared');
      
      // Log activity
      await databaseService.logActivity({
        user_id: user.id,
        activity_type: 'password_history_cleared',
        tool_name: 'profile'
      });

    } catch (error) {
      console.error('Error clearing password history:', error);
      toast.error('Failed to clear password history');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please sign in to view your profile</h1>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Profile</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Overview */}
              <div className="lg:col-span-1">
                <Card className="card-enhanced">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-2xl">
                          {profile?.display_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <CardTitle className="text-xl">
                      {profile?.display_name || profile?.full_name || user.user_metadata?.full_name || user.email}
                    </CardTitle>
                    <CardDescription>
                      {profile?.username && `@${profile.username}`}
                      {!profile?.username && user.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Account Status</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email Verified</span>
                      <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                        {user.email_confirmed_at ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Member Since</span>
                      <span className="text-sm font-medium">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {profile?.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Location</span>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {profile.location}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Account Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Profile Information */}
                <Card className="card-enhanced">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>
                      Your basic profile details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                              value={profileForm.full_name}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                              value={profileForm.username}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                              placeholder="Enter username"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input
                              value={profileForm.display_name}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, display_name: e.target.value }))}
                              placeholder="Enter display name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Website</Label>
                            <Input
                              value={profileForm.website}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                              placeholder="https://your-website.com"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input
                            value={profileForm.location}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Enter your location"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bio</Label>
                          <Textarea
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                            placeholder="Tell us about yourself..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleProfileUpdate} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{profile?.full_name || "Not provided"}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Email Address</Label>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Username</Label>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{profile?.username ? `@${profile.username}` : "Not set"}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Website</Label>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span>{profile?.website || "Not provided"}</span>
                            </div>
                          </div>
                        </div>
                        {profile?.bio && (
                          <div className="space-y-2">
                            <Label>Bio</Label>
                            <div className="p-3 bg-muted rounded-md">
                              <span>{profile.bio}</span>
                            </div>
                          </div>
                        )}
                        <Button onClick={() => setIsEditing(true)} className="btn-enhanced hover-lift">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Account Statistics */}
                <Card className="card-enhanced">
                  <CardHeader>
                    <CardTitle>Account Statistics</CardTitle>
                    <CardDescription>
                      Overview of your account activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{stats.totalActivity}</div>
                        <div className="text-sm text-muted-foreground">Total Activities</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{stats.totalDownloads}</div>
                        <div className="text-sm text-muted-foreground">Downloads</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{stats.totalFiles}</div>
                        <div className="text-sm text-muted-foreground">Files Processed</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{stats.totalPasswords}</div>
                        <div className="text-sm text-muted-foreground">Passwords Generated</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your recent tool usage and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Activity className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">
                              {activity.activity_type.replace(/_/g, ' ')}
                            </p>
                            {activity.tool_name && (
                              <p className="text-sm text-muted-foreground">
                                Tool: {activity.tool_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No activity yet. Start using our tools to see your activity here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Password History */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Password History
                  </CardTitle>
                  <CardDescription>
                    Recently generated passwords
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {passwordHistory.length > 0 ? (
                    <div className="space-y-3">
                      {passwordHistory.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">••••••••</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearPasswordHistory}
                        className="w-full"
                      >
                        Clear History
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Key className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No password history</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* File Uploads */}
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    File Processing
                  </CardTitle>
                  <CardDescription>
                    Recently processed files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fileUploads.length > 0 ? (
                    <div className="space-y-3">
                      {fileUploads.slice(0, 5).map((upload) => (
                        <div key={upload.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium truncate max-w-32">
                                {upload.original_filename}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {upload.tool_used}
                              </p>
                            </div>
                          </div>
                          <Badge variant={upload.processing_status === 'completed' ? 'default' : 'secondary'}>
                            {upload.processing_status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No file uploads</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Change Password */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your account password
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <Button onClick={handlePasswordUpdate} disabled={loading || !newPassword || !confirmPassword}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                    Update Password
                  </Button>
                </div>

                <Separator />

                {/* Account Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Account Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Your account details
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account Created</Label>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Last Sign In</Label>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(user.last_sign_in_at || user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 