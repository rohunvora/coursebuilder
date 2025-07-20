# Vercel Deployment Guide for Course Builder

## Prerequisites

1. **Supabase Project** configured (see [SUPABASE-SETUP.md](./SUPABASE-SETUP.md))
2. **Vercel Account** at [vercel.com](https://vercel.com)
3. **GitHub Repository** with your Course Builder code

## Environment Variables

You need to configure the following environment variables in Vercel:

### Required Variables

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `DATABASE_URL` | Supabase connection string | Supabase Dashboard → Settings → Database → Connection Pooling |
| `OPENAI_API_KEY` | OpenAI API key | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Supabase Dashboard → Settings → API |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (for admin operations) | Not required |
| `NEXT_PUBLIC_DEBUG_MODE` | Show debug panel | `"true"` |
| `NEXT_PUBLIC_TEST_MODE` | Enable test features | `"true"` |
| `NEXT_PUBLIC_ENABLE_ACHIEVEMENTS` | Enable achievements | `"true"` |
| `NEXT_PUBLIC_ENABLE_SPACED_REPETITION` | Enable spaced repetition | `"true"` |
| `NEXT_PUBLIC_ENABLE_CONFIDENCE_TRACKING` | Enable confidence tracking | `"true"` |

## Deployment Steps

### 1. Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select the framework preset: **Next.js**

### 2. Configure Environment Variables

1. In the deployment screen, expand "Environment Variables"
2. Add each required variable:
   - Name: `DATABASE_URL`
   - Value: Your Supabase connection string
   - Environment: Production, Preview, Development
3. Repeat for all required variables

### 3. Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be available at `https://[project-name].vercel.app`

## Post-Deployment Setup

### 1. Test the Deployment

1. Visit your deployed URL
2. Try generating a course
3. Complete a few questions
4. Check that progress is saved

### 2. Configure Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### 3. Monitor Performance

1. Check Vercel Analytics for performance metrics
2. Monitor Supabase Dashboard for database usage
3. Set up alerts for errors or high usage

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all environment variables are set correctly
- Verify `DATABASE_URL` uses connection pooling format

### Database Connection Issues

- Verify Supabase project is active
- Check connection pooling URL is correct
- Ensure no IP restrictions in Supabase settings

### API Rate Limiting

- OpenAI API key might have rate limits
- Consider implementing additional caching
- Monitor API usage in OpenAI dashboard

### Performance Issues

- Enable Vercel Edge Functions for better performance
- Use Vercel Analytics to identify bottlenecks
- Consider upgrading Supabase plan for more connections

## Security Best Practices

1. **Never commit secrets** to your repository
2. **Use environment variables** for all sensitive data
3. **Enable Vercel's security headers** (already configured in vercel.json)
4. **Monitor logs** for suspicious activity
5. **Keep dependencies updated** with `npm audit`

## Updating Your Deployment

To update your deployed app:

1. Push changes to your GitHub repository
2. Vercel will automatically deploy the changes
3. Preview deployments are created for pull requests

Or manually:

```bash
vercel --prod
```

## Cost Optimization

- **Vercel Free Tier**: Sufficient for most educational projects
- **Supabase Free Tier**: 500MB database, 2GB bandwidth
- **OpenAI**: Pay-as-you-go, implement caching to reduce costs

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)
- Course Builder Issues: [GitHub Issues](https://github.com/rohunvora/coursebuilder/issues)