# Supabase Database Setup for Course Builder

## Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Enter project details:
   - Name: `coursebuilder`
   - Database Password: (save this!)
   - Region: Choose closest to your users

### 2. Get Database URL

Once your project is created:

1. Go to Settings → Database
2. Copy the **Connection string** under "Connection Pooling"
3. It should look like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### 3. Configure Vercel

In your Vercel project settings:

1. Go to Settings → Environment Variables
2. Add:
   ```
   DATABASE_URL = "your-supabase-connection-string"
   OPENAI_API_KEY = "your-openai-key"
   ```

### 4. Update Local Development

Create `.env.local`:
```env
DATABASE_URL="your-supabase-connection-string"
OPENAI_API_KEY="your-openai-key"
```

## Database Schema

The Prisma schema is already configured for PostgreSQL. To push the schema to Supabase:

```bash
# Install dependencies
npm install

# Push schema to Supabase
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

## Features Enabled by Supabase

1. **Persistent Storage**: All user progress, courses, and achievements stored permanently
2. **Real-time Updates**: Potential for real-time features using Supabase subscriptions
3. **Row Level Security**: Can add user authentication and permissions
4. **Automatic Backups**: Supabase handles database backups
5. **Global Edge Network**: Fast database access worldwide

## Testing the Connection

```bash
# Test locally
npm run dev

# Check database in Supabase dashboard
# Go to Table Editor to see your tables
```

## Troubleshooting

### Connection Issues
- Ensure you're using the "Connection Pooling" URL (not the direct connection)
- Check that your IP isn't blocked (Supabase → Settings → Database → Allowed IPs)

### Schema Issues
- Run `npx prisma db push --force-reset` to reset the schema (WARNING: deletes all data)
- Check Supabase logs: Dashboard → Logs → Database

### Performance
- Use connection pooling URL for serverless environments
- Consider adding indexes for frequently queried fields

## Next Steps

1. Deploy to Vercel with the DATABASE_URL set
2. Test all features (user creation, course generation, progress tracking)
3. Monitor database usage in Supabase dashboard
4. Consider adding Supabase Auth for user management