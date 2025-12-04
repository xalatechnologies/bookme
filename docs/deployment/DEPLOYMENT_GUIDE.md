# Booknor Deployment Guide - Phase 1

**Migration Status:** ✅ COMPLETE
**Ready for Production:** Yes
**Last Updated:** October 27, 2025

---

## Quick Start

### Prerequisites Checklist

Before deploying, ensure you have:

- [x] Supabase instance running (Docker or Cloud)
- [x] Database schema migrated
- [x] Seed data inserted
- [x] TypeScript types generated
- [x] Dependencies installed (`npm install`)
- [x] Environment variables configured

---

## Environment Setup

### 1. Environment Variables

Create or update your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# For production, use your production Supabase instance
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### 2. Get Supabase Keys

**Local Development:**
```bash
cd backend
npx supabase status
# Copy the API URL and anon key
```

**Production:**
- Go to your Supabase project dashboard
- Settings → API
- Copy the Project URL and anon key

---

## Local Development

### Starting the Application

```bash
# 1. Ensure Supabase is running
cd backend
npx supabase start

# 2. Verify database has data
psql -h localhost -p 54322 -U postgres -d postgres -c "SELECT COUNT(*) FROM bookings;"

# 3. Start the frontend
cd ..
npm run dev

# 4. Open browser
# Navigate to http://localhost:5173
```

### Testing the Migrated Features

1. **Login** with a test user
2. Navigate to **`/user/bookings`**
3. Test features:
   - ✅ View bookings list
   - ✅ Filter by status (Alle, Bekreftet, Ventende, etc.)
   - ✅ Filter by date range (Today, Week, Month, Past, Upcoming)
   - ✅ Search by facility name or booking ID
   - ✅ Sort bookings (Date, Price, Created)
   - ✅ Select bookings (checkbox)
   - ✅ View booking details (click card or eye icon)
   - ✅ Cancel booking (trash icon)
   - ✅ Share booking
   - ✅ Add to calendar

---

## Production Deployment

### Step 1: Supabase Production Setup

#### Option A: Supabase Cloud (Recommended)

1. **Create Project:**
   ```
   - Go to https://supabase.com
   - Create new project
   - Choose region closest to users
   - Set strong database password
   ```

2. **Run Migrations:**
   ```bash
   # Connect to your production project
   cd backend
   npx supabase link --project-ref your-project-ref

   # Push migrations
   npx supabase db push
   ```

3. **Seed Production Data:**
   ```bash
   # Get production connection string from Supabase dashboard
   psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
     -f supabase/seed.sql
   ```

#### Option B: Self-Hosted Supabase

Follow [Supabase Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting)

### Step 2: Frontend Deployment

#### Vercel (Recommended for Next.js/Vite)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

#### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

```bash
# Build and run
docker build -t booknor-frontend .
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=your-url \
  -e VITE_SUPABASE_ANON_KEY=your-key \
  booknor-frontend
```

---

## Database Management

### Backup Strategy

**Automated Backups (Supabase Cloud):**
- Daily automatic backups (included)
- Point-in-time recovery available
- 7-day retention on Free tier
- 30-day retention on Pro tier

**Manual Backup:**
```bash
# Backup entire database
pg_dump -h db.your-project-ref.supabase.co \
  -U postgres -d postgres > backup_$(date +%Y%m%d).sql

# Backup specific table
pg_dump -h db.your-project-ref.supabase.co \
  -U postgres -d postgres -t bookings > bookings_backup.sql
```

### Restore from Backup

```bash
psql -h db.your-project-ref.supabase.co \
  -U postgres -d postgres < backup_20251027.sql
```

---

## Monitoring & Maintenance

### Health Checks

**Backend (Supabase):**
```bash
# Check Supabase status
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key"

# Expected: 200 OK
```

**Frontend:**
```bash
# Check app is responding
curl https://your-app.vercel.app

# Expected: 200 OK with HTML
```

### Performance Monitoring

**Key Metrics to Track:**

1. **Database Performance:**
   - Query response times
   - Connection pool usage
   - Cache hit rates
   - Slow query logs

2. **Application Performance:**
   - Page load times
   - API response times
   - React Query cache effectiveness
   - Error rates

**Supabase Dashboard:**
- Go to Project → Reports
- Monitor:
  - Database CPU/Memory
  - API requests per second
  - Storage usage
  - Active connections

### Log Monitoring

**Supabase Logs:**
```sql
-- View recent errors
SELECT * FROM logs.error_log
ORDER BY created_at DESC
LIMIT 100;

-- View slow queries
SELECT * FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;
```

---

## Troubleshooting

### Common Issues

#### Issue 1: "Cannot connect to Supabase"

**Symptoms:**
- Frontend shows loading spinner indefinitely
- Console error: "Failed to fetch"

**Solutions:**
```bash
# 1. Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# 2. Verify Supabase is running
npx supabase status

# 3. Check CORS settings in Supabase dashboard
# Settings → API → CORS Configuration
```

#### Issue 2: "No bookings displayed"

**Symptoms:**
- Page loads but shows "Ingen bookinger"
- User is logged in

**Solutions:**
```bash
# 1. Check if user has bookings
psql -h localhost -p 54322 -U postgres -d postgres \
  -c "SELECT * FROM bookings WHERE user_id = 'user-id-here';"

# 2. Check RLS policies
psql -h localhost -p 54322 -U postgres -d postgres \
  -c "SELECT * FROM pg_policies WHERE tablename = 'bookings';"

# 3. Verify auth context
# Check browser console for auth.user object
```

#### Issue 3: "TypeScript errors after deployment"

**Symptoms:**
- Build fails with type errors
- Types don't match database schema

**Solutions:**
```bash
# Regenerate types from production database
npx supabase gen types typescript \
  --project-id your-project-ref > src/types/database.ts

# Rebuild
npm run build
```

#### Issue 4: "React Query cache issues"

**Symptoms:**
- Stale data displayed
- Changes not reflected immediately

**Solutions:**
```typescript
// In your code, adjust stale times
useUserBookings(userId, {
  staleTime: 30 * 1000, // Reduce from 2 minutes to 30 seconds
});

// Or force refetch
const { refetch } = useUserBookings(userId);
refetch();
```

---

## Security Checklist

### Before Going Live

- [ ] **Environment Variables**
  - [ ] Production Supabase URL configured
  - [ ] Production anon key configured
  - [ ] No hardcoded secrets in code

- [ ] **Row Level Security (RLS)**
  - [ ] RLS enabled on all tables
  - [ ] Policies tested for each table
  - [ ] Users can only access their own bookings

- [ ] **API Security**
  - [ ] Rate limiting configured
  - [ ] CORS properly configured
  - [ ] Service role key secure (never exposed to client)

- [ ] **Authentication**
  - [ ] Email verification enabled
  - [ ] Password requirements configured
  - [ ] Session timeout configured

- [ ] **Database**
  - [ ] Strong database password
  - [ ] Connection pooling enabled
  - [ ] Backups configured
  - [ ] SSL enforced for connections

---

## Performance Optimization

### Frontend Optimizations

1. **Code Splitting:**
   ```typescript
   // Lazy load pages
   const Bookings = lazy(() => import('./pages/user/Bookings'));
   ```

2. **React Query Configuration:**
   ```typescript
   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000, // 5 minutes
         cacheTime: 10 * 60 * 1000, // 10 minutes
         refetchOnWindowFocus: false,
       },
     },
   });
   ```

3. **Image Optimization:**
   - Use WebP format
   - Lazy load images
   - Implement responsive images

### Database Optimizations

1. **Indexes:**
   ```sql
   -- Already created in migration, verify:
   CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
   CREATE INDEX IF NOT EXISTS idx_bookings_facility_id ON bookings(facility_id);
   CREATE INDEX IF NOT EXISTS idx_bookings_starts_at ON bookings(starts_at);
   ```

2. **Connection Pooling:**
   - Supabase includes pgBouncer
   - Configured automatically
   - Monitor pool usage in dashboard

---

## Rollback Plan

### If Issues Occur in Production

#### Quick Rollback (Frontend)

**Vercel:**
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

**Netlify:**
```bash
# Rollback to previous deploy
netlify deploy --prod --alias previous-version
```

#### Database Rollback

```bash
# Restore from backup
psql -h db.your-project-ref.supabase.co \
  -U postgres -d postgres < backup_before_migration.sql
```

#### Code Rollback

```bash
# Revert to old Bookings page
mv src/pages/user/Bookings.tsx.backup src/pages/user/Bookings.tsx

# Rebuild and redeploy
npm run build
vercel --prod
```

---

## Post-Deployment Checklist

### Immediate (Day 1)

- [ ] Verify all pages load correctly
- [ ] Test booking creation flow
- [ ] Test booking cancellation
- [ ] Check error logs (no critical errors)
- [ ] Monitor performance metrics
- [ ] Verify email notifications work

### Week 1

- [ ] Review user feedback
- [ ] Check database performance
- [ ] Monitor error rates
- [ ] Verify backup schedule
- [ ] Review security logs
- [ ] Optimize slow queries if any

### Month 1

- [ ] Analyze usage patterns
- [ ] Plan additional features
- [ ] Review and optimize costs
- [ ] Update documentation
- [ ] Plan next phase migrations

---

## Support & Resources

### Documentation

- **Migration Summary:** `MIGRATION_SUMMARY.md`
- **Component Guide:** `COMPONENT_USAGE_GUIDE.md`
- **This Guide:** `DEPLOYMENT_GUIDE.md`

### Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase Status](https://status.supabase.com)

### React Query Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)

### Getting Help

**For issues related to:**
- **Migration:** Check `MIGRATION_SUMMARY.md`
- **Components:** Check `COMPONENT_USAGE_GUIDE.md`
- **Deployment:** Check this guide
- **Supabase:** Supabase Discord or GitHub Issues
- **React Query:** TanStack Discord

---

## Success Criteria

### Phase 1 is successful when:

- ✅ Users can view their bookings
- ✅ Users can filter and search bookings
- ✅ Users can view booking details
- ✅ Users can cancel bookings
- ✅ Page loads in < 2 seconds
- ✅ No critical errors in logs
- ✅ Data persists correctly
- ✅ Real-time updates work

---

## Next Phases

### Phase 2: Facilities Page
- Migrate Facilities list
- Implement facility search
- Create facility detail views

### Phase 3: Dashboard Page
- Migrate user dashboard
- Implement stats displays
- Create activity feeds

### Phase 4: Other User Pages
- Favorites
- History
- Calendar
- Messages
- Profile

### Phase 5: Admin Pages
- Admin dashboard
- Booking management
- User management
- Analytics

---

## Conclusion

Your Phase 1 migration is **production-ready**. Follow this guide to deploy confidently, and use the monitoring strategies to ensure smooth operation.

**Questions?** Refer to the comprehensive documentation in:
- `MIGRATION_SUMMARY.md`
- `COMPONENT_USAGE_GUIDE.md`

**Good luck with your deployment!** 🚀

---

**Document Version:** 1.0
**Last Updated:** October 27, 2025
**Status:** Production Ready ✅
