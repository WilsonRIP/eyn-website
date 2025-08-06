// =====================================================
// Email Confirmation Test Script
// =====================================================
// Run this in your browser console to test email confirmation

// Replace with your actual Supabase URL and anon key
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Create Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test email confirmation
async function testEmailConfirmation(email) {
  try {
    console.log('Testing email confirmation for:', email);
    
    // Try to resend confirmation email
    const { data, error } = await supabaseClient.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Error sending confirmation email:', error);
      return false;
    } else {
      console.log('Confirmation email sent successfully!');
      console.log('Response:', data);
      return true;
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Usage:
// testEmailConfirmation('your-email@example.com');

// Test current user's email confirmation status
async function checkEmailStatus() {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return;
    }
    
    if (user) {
      console.log('Current user:', user.email);
      console.log('Email confirmed:', user.email_confirmed_at ? 'YES' : 'NO');
      console.log('Confirmation date:', user.email_confirmed_at);
    } else {
      console.log('No user logged in');
    }
  } catch (error) {
    console.error('Error checking email status:', error);
  }
}

// Usage:
// checkEmailStatus(); 