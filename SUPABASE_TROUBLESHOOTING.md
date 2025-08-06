# Supabase API Error Troubleshooting Guide

## 🚨 Current Issue
"Failed to create user: API error happened while trying to communicate with the server"

This error occurs at the Supabase dashboard level, indicating issues with your self-hosted Supabase instance.

## 🔍 Step 1: Check Docker Container Status

First, let's check if all your Supabase services are running properly:

```bash
# Check if Docker containers are running
docker ps

# Check all containers (including stopped ones)
docker ps -a

# Check container logs for errors
docker logs supabase-kong
docker logs supabase-auth
docker logs supabase-db
```

## 🔍 Step 2: Check Supabase Service Logs

Look for specific error messages in the logs:

```bash
# Check Kong (API Gateway) logs
docker logs supabase-kong 2>&1 | grep -i error

# Check Auth service logs
docker logs supabase-auth 2>&1 | grep -i error

# Check Database logs
docker logs supabase-db 2>&1 | grep -i error

# Check all logs for the last 10 minutes
docker logs --since 10m supabase-kong
docker logs --since 10m supabase-auth
```

## 🔍 Step 3: Verify Database Connectivity

Check if the database is accessible:

```bash
# Try to connect to the database
docker exec -it supabase-db psql -U postgres -d postgres

# Or check if the database is responding
docker exec supabase-db pg_isready -U postgres
```

## 🔍 Step 4: Check Service Health

Verify all services are healthy:

```bash
# Check Kong health
curl -f http://localhost:8001/status

# Check Auth service health
curl -f http://localhost:9999/health

# Check if the API is responding
curl -f http://eyn-website-supabase-229e2b-147-79-78-227.traefik.me/auth/v1/health
```

## 🔧 Step 5: Restart Services

If services are down or unhealthy, restart them:

```bash
# Restart all Supabase services
docker-compose restart

# Or restart specific services
docker-compose restart supabase-kong
docker-compose restart supabase-auth
docker-compose restart supabase-db

# Wait for services to be ready
sleep 30
```

## 🔧 Step 6: Check Configuration

Verify your Docker Compose configuration:

```bash
# Check if the compose file is valid
docker-compose config

# Check environment variables
docker-compose exec supabase-auth env | grep -E "(POSTGRES|JWT|SITE_URL)"
```

## 🔧 Step 7: Database Connection Test

Test if the auth service can connect to the database:

```bash
# Check if auth service can reach the database
docker exec supabase-auth nc -zv supabase-db 5432

# Check database connection from auth service
docker exec supabase-auth psql "postgresql://postgres:your_password@supabase-db:5432/postgres" -c "SELECT 1;"
```

## 🔧 Step 8: Reset and Recreate (If Needed)

If the issue persists, you might need to reset:

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Recreate and start
docker-compose up -d

# Wait for services to be ready
sleep 60
```

## 🔧 Step 9: Alternative Approach - Use SQL Directly

If the dashboard still doesn't work, you can create users directly via SQL:

```sql
-- Create a user directly in the database
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'luke.austin.gatz@gmail.com',
  crypt('FQH@pdu@xcx3kdy6gpm', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

## 🔧 Step 10: Check Network and DNS

Verify your network configuration:

```bash
# Check if the domain resolves
nslookup eyn-website-supabase-229e2b-147-79-78-227.traefik.me

# Check if the port is accessible
telnet eyn-website-supabase-229e2b-147-79-78-227.traefik.me 443

# Check local connectivity
curl -v http://localhost:8000/auth/v1/health
```

## 📋 Quick Diagnostic Commands

Run these commands and share the output:

```bash
# 1. Container status
docker ps

# 2. Recent logs
docker logs --tail 50 supabase-auth

# 3. Health check
curl -f http://localhost:8000/auth/v1/health

# 4. Database connectivity
docker exec supabase-db pg_isready -U postgres
```

## 🚀 Next Steps

1. **Run the diagnostic commands** above
2. **Share the output** with me
3. **I'll help you identify** the specific issue
4. **We'll fix it** step by step

## 🔄 If Nothing Works

If all else fails:
1. **Backup your data** (if any)
2. **Recreate the Supabase instance** from scratch
3. **Use the minimal setup** I provided earlier
4. **Test authentication** step by step

Let me know what the diagnostic commands show! 🔍 