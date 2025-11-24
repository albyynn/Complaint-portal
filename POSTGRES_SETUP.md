# Vercel Postgres Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Vercel Postgres Database
1. Go to your Vercel project dashboard
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose your region (closest to your users)
6. Click **Create**

### Step 2: Get Connection Strings
After creating the database:
1. Go to **Storage** → **Your Postgres DB** → **.env.local** tab
2. Copy all the environment variables
3. Create `.env.local` file in your project root
4. Paste the variables

Your `.env.local` should look like:
```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

### Step 3: Initialize Database Schema
1. In Vercel dashboard, go to **Storage** → **Postgres** → **Query**
2. Copy the contents of `schema.sql` file
3. Paste and run the query

OR run locally:
```bash
# If you have psql installed
psql  $POSTGRES_URL < schema.sql
```

### Step 4: Deploy
The app is already configured to use Postgres! Just:
```bash
git add .
git commit -m "Migrate to Vercel Postgres"
git push
```

Vercel will auto-deploy and your data will now persist! ✅

## What Changed
- ❌ OLD: `data/users.json` and `data/complaints.json` (didn't work on Vercel)
- ✅ NEW: Postgres database tables (persistent across deployments)

## Local Development
For local development:
1. Create `.env.local` with your Vercel Postgres credentials
2. Run `npm run dev`
3. The app will connect to your Vercel Postgres database

## Migration (Optional)
If you have existing data in JSON files you want to keep:
1. The old JSON files are still in `data/` folder
2. Manually add important users/complaints through the UI
3. Or use the Vercel Query editor to import

## Troubleshooting
**Error: "No database connection"**
- Check `.env.local` exists with correct credentials
- Restart dev server after adding .env.local

**Data still disappearing**
- Make sure you ran `schema.sql` to create tables
- Check Vercel logs for errors

## Need Help?
Files changed:
- `/src/lib/db-postgres.ts` - New database layer
- `schema.sql` - Database schema
- All API routes automatically use new database
