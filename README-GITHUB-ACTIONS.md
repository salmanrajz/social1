# GitHub Actions Daily TikTok Scraper Setup

## 🚀 **Setup GitHub Actions Cron Job**

### 📋 **Step 1: Push to GitHub**

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Add GitHub Actions daily TikTok scraper"
git remote add origin https://github.com/yourusername/tiktok-daily-scraper.git
git push -u origin main
```

### 🔐 **Step 2: Set Repository Secrets**

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:

**Name:** `DATABASE_URL`  
**Value:** `postgresql://postgres:ItNbms57VeQIFeJH@db.edgitshcqelilcjkndho.supabase.co:5432/postgres?sslmode=disable`

### ⏰ **Step 3: Cron Schedule Configuration**

The workflow is configured to run daily at **9:00 AM UTC**. To change the timezone:

```yaml
# In .github/workflows/daily-scraper.yml
schedule:
  - cron: '0 9 * * *'  # 9:00 AM UTC
```

**Common timezone adjustments:**
- **9 AM EST**: `'0 14 * * *'` (UTC+5)
- **9 AM PST**: `'0 17 * * *'` (UTC+8)
- **9 AM GMT**: `'0 9 * * *'` (UTC+0)

### 🧪 **Step 4: Test the Workflow**

1. Go to **Actions** tab in your GitHub repository
2. Click **Daily TikTok Trending Products Scraper**
3. Click **Run workflow** → **Run workflow** (manual trigger)
4. Monitor the execution logs

### 📊 **Step 5: Monitor Daily Execution**

#### **Check Workflow Runs:**
- **Actions** tab → **Daily TikTok Trending Products Scraper**
- View logs for each daily run
- Check success/failure status

#### **Check Database:**
```sql
-- View daily data
SELECT collection_date, COUNT(*) as products, SUM(gmv) as total_gmv
FROM daily_trending_products 
GROUP BY collection_date 
ORDER BY collection_date DESC;

-- Top products today
SELECT ranking, product_name, gmv, views, units_sold
FROM daily_trending_products 
WHERE collection_date = CURRENT_DATE
ORDER BY ranking
LIMIT 10;
```

### 🔧 **Workflow Features**

#### **Automatic Triggers:**
- ✅ **Daily at 9 AM UTC**: Automatic cron execution
- ✅ **Manual Trigger**: Run anytime via GitHub UI
- ✅ **Push Trigger**: Optional - runs on code changes

#### **Error Handling:**
- ✅ **API Failures**: Graceful handling with retries
- ✅ **Database Errors**: Detailed error logging
- ✅ **Timeout Protection**: 15-second request timeout
- ✅ **Exit Codes**: Proper success/failure reporting

#### **Monitoring:**
- ✅ **Success Notifications**: Console output on completion
- ✅ **Failure Alerts**: Error details in GitHub Actions logs
- ✅ **Execution Time**: Start/end timestamps
- ✅ **Data Validation**: Product count and GMV reporting

### 📈 **Expected Daily Results**

After setup, you'll see:
- **🕘 9:00 AM**: GitHub Action triggers automatically
- **📡 API Calls**: Fetches 100 trending products
- **💾 Database**: Stores in Supabase `daily_trending_products`
- **📊 Analytics**: GMV, views, engagement tracking
- **📅 History**: Daily datasets for trend analysis

### 🛠️ **Troubleshooting**

#### **Workflow Not Running:**
1. Check **Actions** tab for errors
2. Verify `DATABASE_URL` secret is set
3. Check cron schedule syntax
4. Ensure repository is public (or has Actions enabled)

#### **Database Connection Issues:**
1. Verify Supabase connection string
2. Check SSL configuration (`sslmode=disable`)
3. Test connection manually with `test-supabase-connection.js`

#### **API Rate Limits:**
1. Check TikTok API status
2. Verify authentication cookies
3. Monitor request frequency in logs

### 🎯 **Success Metrics**

- **✅ Daily Execution**: 100 products collected
- **✅ Data Quality**: Complete product information
- **✅ Reliability**: 99%+ uptime with GitHub Actions
- **✅ Performance**: Fast execution (< 5 minutes)

### 📞 **Support**

If you encounter issues:
1. Check GitHub Actions logs
2. Verify repository secrets
3. Test database connectivity
4. Check API endpoint status

## 🎉 **Ready to Deploy!**

Your TikTok daily scraper is now configured for GitHub Actions with automatic daily execution at 9 AM! 🚀

### **Next Steps:**
1. Push code to GitHub
2. Set `DATABASE_URL` secret
3. Test manual run
4. Monitor daily execution

**The scraper will automatically run every day at 9 AM UTC!** ⏰
