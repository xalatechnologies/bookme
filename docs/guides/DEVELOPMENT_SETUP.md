# Booknor - Development Setup Guide

## Architecture Overview

Booknor is a **Supabase-powered React application** with:
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **No separate backend server required** - All backend logic in Supabase

---

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
  - Required for local Supabase instance
  - Must be running before starting Supabase

### Optional but Recommended
- **VS Code** with extensions:
  - Supabase Snippets
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Local Supabase

Make sure Docker Desktop is running, then:

```bash
npx supabase start
```

This will:
- Start PostgreSQL database
- Start Supabase services (Auth, Storage, Realtime)
- Apply all migrations automatically
- Create test users

**Output will show:**
```
API URL: http://127.0.0.1:54321
Studio URL: http://127.0.0.1:54323
Anon key: sb_publishable_...
Service key: sb_secret_...
```

### 3. Setup Test Users

```bash
node setup-test-users.js
```

This creates all test users with the password: `Test123!`

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3006** (or next available port)

---

## Supabase CLI Commands

### Essential Commands

```bash
# Start Supabase (must have Docker running)
npx supabase start

# Check status
npx supabase status

# Stop Supabase
npx supabase stop

# Stop and remove all data
npx supabase stop --no-backup

# Reset database (reapply all migrations)
npx supabase db reset

# View logs
npx supabase logs
```

### Database Management

```bash
# Create a new migration
npx supabase migration new <migration_name>

# Apply migrations
npx supabase db reset

# Generate TypeScript types from database
npx supabase gen types typescript --local > src/types/database.ts

# Access PostgreSQL directly
npx supabase db psql
```

### Testing & Debugging

```bash
# View real-time logs
npx supabase logs --follow

# Check specific service logs
npx supabase logs auth
npx supabase logs storage
npx supabase logs realtime

# Run database migrations in dry-run mode
npx supabase db reset --dry-run
```

---

## Accessing Services

Once Supabase is running:

### Supabase Studio (Database Dashboard)
**URL**: http://localhost:54323

Features:
- Browse tables and data
- Test queries in SQL editor
- View authentication users
- Manage storage buckets
- View logs and metrics

### Mailpit (Email Testing)
**URL**: http://localhost:54324

Captures all emails sent during development:
- Magic link login emails
- Password reset emails
- Booking confirmations

### API Endpoint
**URL**: http://localhost:54321

Direct access to PostgREST API:
- `/rest/v1/` - REST API
- `/auth/v1/` - Authentication
- `/storage/v1/` - Storage

---

## Test Users

All users have password: `Test123!`

| Email | Role | Organization | Access Level |
|-------|------|--------------|--------------|
| test.user@drammen.kommune.no | Customer | Drammen Kommune | Own bookings only |
| staff@drammen.kommune.no | Staff | Drammen Kommune | Manage facilities & bookings |
| admin@drammen.kommune.no | Admin | Drammen Kommune | Organization settings |
| owner@drammen.kommune.no | Owner | Drammen Kommune | Full organization control |
| superadmin@booknor.no | Platform Admin | (None) | Platform-wide access |

---

## Environment Variables

### Local Development (.env.local)

```bash
# Supabase Local Development URL
VITE_SUPABASE_URL=http://127.0.0.1:54321

# Supabase Local Anon Key (from `npx supabase status`)
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Mode
VITE_USE_SUPABASE=true

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_GROUPS=true
VITE_ENABLE_RECURRING=true
VITE_ENABLE_MESSAGING=true

# Development
VITE_DEV_MODE=true
```

### Production (.env.production)

```bash
# Supabase Production URL
VITE_SUPABASE_URL=https://your-project.supabase.co

# Supabase Production Anon Key
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Application Mode
VITE_USE_SUPABASE=true

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_GROUPS=true
VITE_ENABLE_RECURRING=true
VITE_ENABLE_MESSAGING=true

# Production Mode
VITE_DEV_MODE=false
```

---

## Database Migrations

### Migration Files Location

```
supabase/migrations/
├── 20230101000000_enable_extensions.sql
├── 20230101000001_core_schema.sql
├── 20230101000003_security_setup.sql
├── 20230101000004_rls_policies.sql
├── 20230101000006_rpc_functions.sql
├── 20231026000001_add_zones.sql
├── 20231026000002_enhance_facilities.sql
└── ... (more migrations)
```

### Creating New Migrations

1. **Create migration file**:
   ```bash
   npx supabase migration new add_my_feature
   ```

2. **Edit the migration file** in `supabase/migrations/`

3. **Test locally**:
   ```bash
   npx supabase db reset
   ```

4. **Commit to git**:
   ```bash
   git add supabase/migrations/
   git commit -m "Add my feature migration"
   ```

### Best Practices

- ✅ Always create idempotent migrations (use `IF NOT EXISTS`, `IF EXISTS`)
- ✅ Test migrations with `npx supabase db reset`
- ✅ Never modify existing migrations (create new ones)
- ✅ Use descriptive migration names
- ✅ Include rollback logic when possible

---

## Development Workflow

### Daily Workflow

1. **Start Docker Desktop**
2. **Start Supabase**:
   ```bash
   npx supabase start
   ```
3. **Start dev server**:
   ```bash
   npm run dev
   ```
4. **Access app**: http://localhost:3006
5. **Access Studio**: http://localhost:54323

### Making Database Changes

1. Create migration:
   ```bash
   npx supabase migration new my_changes
   ```
2. Edit migration file
3. Apply migration:
   ```bash
   npx supabase db reset
   ```
4. Regenerate types:
   ```bash
   npx supabase gen types typescript --local > src/types/database.ts
   ```

### Testing Authentication & RBAC

Run comprehensive tests:

```bash
# Test all user roles and permissions
node test-rbac.js
```

This tests:
- ✅ User authentication (all roles)
- ✅ Role verification
- ✅ Data access permissions
- ✅ Cross-role restrictions

---

## Troubleshooting

### Docker Issues

**Problem**: "Cannot connect to Docker daemon"
```bash
# Solution: Start Docker Desktop and wait for it to fully start
```

**Problem**: Port conflicts (54321, 54322, 54323 already in use)
```bash
# Solution: Stop other Supabase instances
npx supabase stop --no-backup

# Or stop specific ports
lsof -ti:54321 | xargs kill -9
```

### Supabase Issues

**Problem**: "Error connecting to Supabase"
```bash
# Solution: Check if Supabase is running
npx supabase status

# Restart if needed
npx supabase stop
npx supabase start
```

**Problem**: Migrations not applied
```bash
# Solution: Reset database
npx supabase db reset
```

**Problem**: Auth not working
```bash
# Solution: Check if users exist
npx supabase db psql
SELECT email FROM auth.users;

# Recreate users
node setup-test-users.js
```

### Frontend Issues

**Problem**: "User not authenticated" errors
```bash
# Solution: Clear localStorage and log in again
# In browser console:
localStorage.clear();
location.reload();
```

**Problem**: Port 3000 already in use
```bash
# Solution: Vite automatically tries next available port
# Check terminal output for actual port (usually 3006)
```

**Problem**: TypeScript errors about database types
```bash
# Solution: Regenerate types
npx supabase gen types typescript --local > src/types/database.ts
```

---

## Project Structure

```
booknor/
├── src/
│   ├── components/        # React components
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Route pages
│   ├── services/          # API services
│   │   └── supabase/      # Supabase service layer
│   ├── types/             # TypeScript types
│   │   └── database.ts    # Generated from Supabase schema
│   └── lib/               # Utility functions
├── supabase/
│   ├── config.toml        # Supabase configuration
│   ├── migrations/        # Database migrations
│   └── seed.sql          # Seed data (optional)
├── public/                # Static assets
├── .env.local            # Local environment variables
├── setup-test-users.js   # Test user setup script
├── test-rbac.js          # RBAC test suite
└── package.json          # Node.js dependencies
```

---

## Useful Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Docs](https://vitejs.dev/)

### Supabase Specific
- [Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

### Project Resources
- `RBAC_TEST_RESULTS.md` - Authentication & authorization test results
- `supabase/migrations/` - Database schema documentation

---

## Production Deployment

### Prerequisites

1. **Create Supabase project**: https://app.supabase.com
2. **Get production credentials** from project settings

### Deploy Database

```bash
# Link to production project
npx supabase link --project-ref your-project-ref

# Push migrations to production
npx supabase db push

# Verify migrations
npx supabase migration list
```

### Deploy Frontend

1. **Build production bundle**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**:
   - Connect your GitHub repository
   - Set environment variables
   - Deploy!

3. **Set production environment variables**:
   - `VITE_SUPABASE_URL` - Your production Supabase URL
   - `VITE_SUPABASE_ANON_KEY` - Your production anon key

---

## Security Checklist

### Before Production

- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Test all RLS policies thoroughly
- [ ] Change all default passwords
- [ ] Remove or secure test users
- [ ] Enable email verification for signups
- [ ] Set up proper CORS policies
- [ ] Configure rate limiting
- [ ] Review and test authentication flows
- [ ] Set up monitoring and alerts
- [ ] Configure backup schedule

---

## Getting Help

### Issues & Questions

1. **Check this documentation first**
2. **Review test results**: `RBAC_TEST_RESULTS.md`
3. **Check Supabase logs**: `npx supabase logs`
4. **Supabase Discord**: https://discord.supabase.com
5. **GitHub Issues**: Create an issue in the repository

### Common Commands Reference

```bash
# Quick start
npx supabase start && npm run dev

# Reset everything
npx supabase stop --no-backup && npx supabase start

# Run tests
node test-rbac.js

# Generate types
npx supabase gen types typescript --local > src/types/database.ts

# Database access
npx supabase db psql
```

---

## Notes

- **No separate backend needed** - Everything runs through Supabase
- **RLS is disabled in local dev** for easier testing
- **Test users are automatically created** with `setup-test-users.js`
- **All passwords are `Test123!`** in development
- **Migrations are applied automatically** on `npx supabase start`
