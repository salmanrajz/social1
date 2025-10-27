# GitHub Actions Setup Guide

## 🔑 **Step 1: Set Up GitHub Secret**

1. Go to: **https://github.com/salmanrajz/social1/settings/secrets/actions**
2. Click **"New repository secret"**
3. **Name**: `SUPABASE_KEY`
4. **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZ2l0c2hjcWVsaWxjamtuZGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTExMzksImV4cCI6MjA3Njk4NzEzOX0.rgethMENBCp6F57GAyQknSZjmKdxpQaoJcr6BYOUIq8`
5. Click **"Add secret"**

## 🚀 **Step 2: Test the Workflow**

1. Go to: **https://github.com/salmanrajz/social1/actions**
2. Click **"Daily TikTok Trending Products Scraper"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Watch the execution logs

## 📊 **Expected Results**

You should see:
```
✅ Supabase connection successful!
📡 Fetching products using API's original ranking...
📄 Page 1 (offset: 0, limit: 12)...
✅ Got 12 products (total: 12)
... (continues for 20 pages)
🎯 Fetched 240 products total
💾 Inserting 240 products for date: 2025-10-27
✅ Successfully inserted 240 products for 2025-10-27
🎯 Daily Scraping Complete!
📊 Products: 240 (Target: 240)
💰 Total GMV: £782M+
✅ GitHub Action completed successfully
```

## 🎯 **What This Achieves**

- **✅ Daily Automation**: Runs every day at 9 AM UTC
- **✅ 240 Products**: Collects trending TikTok products
- **✅ Supabase Storage**: Saves data to your database
- **✅ Complete Analytics**: GMV, engagement, rankings
- **✅ Historical Tracking**: Date-wise data organization

## 🔧 **Changes Made**

1. **Updated GitHub Actions**: Now uses Supabase client instead of raw PostgreSQL
2. **Simplified Connection**: No more IPv6 connection issues
3. **Better Error Handling**: Clear success/failure messages
4. **Dependency Management**: Installs Supabase client automatically

Your GitHub Actions workflow is now ready to run successfully! 🚀
