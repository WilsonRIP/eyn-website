# Better Auth + Supabase Fix Instructions

## Issue Fixed
The error `Module not found: Package path ./adapters/supabase is not exported from package better-auth` occurred because Better Auth v1.3.4 doesn't have a built-in Supabase adapter. Better Auth connects directly to PostgreSQL databases instead.

## Required Steps to Complete the Fix

### 1. Install Required Dependencies
Run one of these commands in your project directory:

```bash
# If using npm
npm install pg @types/pg

# If using bun (recommended, since you have bun.lock)
bun add pg @types/pg

# If using yarn
yarn add pg @types/pg
```

### 2. Update Environment Variables
I've updated your `.env.local` file, but you need to replace the placeholder values:

**Required Changes:**
- Replace `your-db-password` with your actual Supabase database password
- Replace `your-very-secure-random-string-here` with a secure random string (at least 32 characters)
- Add your actual social provider credentials if you want to use them

**To generate a secure secret:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using online generator
# Visit https://generate-secret.vercel.app/32
```

### 3. Set Up Database Schema
Better Auth requires specific database tables. Run this command to generate and apply the schema:

```bash
# Install Better Auth CLI globally
npm install -g better-auth

# Generate schema (in your project directory)
npx better-auth generate

# Or apply directly to database (if using Kysely adapter)
npx better-auth migrate
```

### 4. Alternative: Manual Schema Setup
If the CLI doesn't work, you can create the tables manually. The core Better Auth schema includes:

- `user` table
- `session` table  
- `account` table
- `verification` table

Check the Better Auth documentation for the exact schema: https://www.better-auth.com/docs/concepts/database

### 5. Test the Configuration
After completing steps 1-3, try running your development server:

```bash
npm run dev
# or
bun dev
```

## Key Changes Made

### `src/lib/auth.ts`
- ✅ Removed invalid `SupabaseAdapter` import
- ✅ Added PostgreSQL connection using `pg` package
- ✅ Configured direct database connection to your Supabase instance
- ✅ Added proper secret configuration

### `.env.local`
- ✅ Added `DATABASE_URL` for PostgreSQL connection
- ✅ Added `BETTER_AUTH_SECRET` for JWT signing
- ✅ Added placeholders for social provider credentials
- ✅ Added email configuration options

## How Better Auth + Supabase Works Now

1. **Direct Database Connection**: Better Auth connects directly to Supabase's PostgreSQL database using a connection string
2. **No Supabase Auth Conflict**: This setup bypasses Supabase Auth entirely and uses Better Auth for all authentication
3. **Full Control**: You get all Better Auth features while using Supabase's database

## Troubleshooting

### If you get connection errors:
1. Verify your Supabase database password is correct
2. Check that your Supabase instance is running
3. Ensure the database URL format is correct

### If tables don't exist:
1. Run the Better Auth CLI to create tables
2. Or manually create the required schema in your Supabase dashboard

### If environment variables aren't loading:
1. Restart your development server after changing `.env.local`
2. Ensure there are no syntax errors in the `.env.local` file

## Next Steps After Fix

1. Configure your social providers (Google, GitHub) if needed
2. Set up email configuration for password reset/verification
3. Customize the authentication flow as needed
4. Test authentication endpoints at `http://localhost:3000/api/auth/*`

## Resources
- [Better Auth Documentation](https://www.better-auth.com)
- [Better Auth + Supabase Guide](https://www.better-auth.com/docs/guides/supabase-migration-guide)
- [Better Auth Database Setup](https://www.better-auth.com/docs/concepts/database)
