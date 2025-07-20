# Course Builder Deployment Checklist

## Pre-Deployment Setup

### 1. Supabase Configuration ✓
- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Copy connection string (pooling mode) from Settings → Database
- [ ] Copy Project URL from Settings → API
- [ ] Copy Anon Key from Settings → API
- [ ] Copy Service Role Key from Settings → API (optional)

### 2. Local Testing ✓
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Fill in all Supabase credentials in `.env.local`
- [ ] Run `npm install` to install dependencies
- [ ] Run `npm run setup-db:seed` to create database schema
- [ ] Run `npm run dev` and test locally
- [ ] Verify course generation works
- [ ] Verify data persistence works

### 3. Prepare for Vercel ✓
- [ ] Push code to GitHub repository
- [ ] Ensure `.gitignore` excludes sensitive files
- [ ] Verify `vercel.json` configuration is correct

## Vercel Deployment

### 1. Import Project
- [ ] Go to [vercel.com/new](https://vercel.com/new)
- [ ] Import your GitHub repository
- [ ] Select "Next.js" as framework preset

### 2. Configure Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

#### Required Variables:
- [ ] `DATABASE_URL` - Supabase connection pooling URL
- [ ] `OPENAI_API_KEY` - Your OpenAI API key
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

#### Optional Variables:
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - For admin operations
- [ ] `NEXT_PUBLIC_DEBUG_MODE` - Set to "false" for production
- [ ] `NEXT_PUBLIC_TEST_MODE` - Set to "false" for production
- [ ] `NEXT_PUBLIC_ENABLE_ACHIEVEMENTS` - Default: "true"
- [ ] `NEXT_PUBLIC_ENABLE_SPACED_REPETITION` - Default: "true"
- [ ] `NEXT_PUBLIC_ENABLE_CONFIDENCE_TRACKING` - Default: "true"

### 3. Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Note your deployment URL

## Post-Deployment Verification

### 1. Basic Functionality
- [ ] Visit your deployment URL
- [ ] Generate a test course
- [ ] Complete several questions
- [ ] Refresh page and verify data persists
- [ ] Check achievements unlock properly

### 2. API Endpoints
Test these endpoints:
- [ ] `GET /api/debug` - Should return debug info
- [ ] `POST /api/generate` - Should create courses
- [ ] `GET /api/user/dashboard` - Should return user data

### 3. Performance Check
- [ ] Run Lighthouse audit (should score >90)
- [ ] Test on mobile devices
- [ ] Verify no console errors in production

### 4. Database Verification
- [ ] Check Supabase dashboard for new tables
- [ ] Verify data is being written correctly
- [ ] Monitor connection pool usage

## Production Configuration

### 1. Security
- [ ] Set `NEXT_PUBLIC_DEBUG_MODE` to "false"
- [ ] Set `NEXT_PUBLIC_TEST_MODE` to "false"
- [ ] Verify no sensitive data in client code
- [ ] Check CORS headers are appropriate

### 2. Custom Domain (Optional)
- [ ] Add custom domain in Vercel settings
- [ ] Configure DNS records
- [ ] Verify SSL certificate

### 3. Monitoring
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (optional)
- [ ] Monitor Supabase usage metrics
- [ ] Set up alerts for high usage

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check all environment variables are set
   - Verify DATABASE_URL format is correct
   - Check build logs for specific errors

2. **Database Connection Errors**
   - Ensure using connection pooling URL
   - Check Supabase project is active
   - Verify no IP restrictions

3. **Course Generation Fails**
   - Verify OPENAI_API_KEY is valid
   - Check API rate limits
   - Monitor OpenAI usage

4. **Data Not Persisting**
   - Check browser console for errors
   - Verify Supabase credentials
   - Check Prisma schema is synced

## Maintenance

### Regular Tasks:
- [ ] Monitor Supabase usage (monthly)
- [ ] Check OpenAI API usage (weekly)
- [ ] Update dependencies (monthly)
- [ ] Review error logs (weekly)
- [ ] Backup database (as needed)

### Updates:
1. Push changes to GitHub
2. Vercel auto-deploys from main branch
3. Test in preview deployment first
4. Promote to production when ready

## Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Course Builder Issues**: GitHub Issues page

---

Last Updated: July 2025
Version: 1.2.0