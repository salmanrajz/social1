# TikTok Daily Scraper - Vercel Deployment

## 🚀 Deploy to Vercel with Daily Cron Job

### 📋 Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Database Access**: MySQL database credentials

### 🔧 Setup Steps

#### 1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Add TikTok daily scraper with Vercel cron"
git remote add origin https://github.com/yourusername/tiktok-daily-scraper.git
git push -u origin main
```

#### 2. **Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration

#### 3. **Set Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://postgres:ItNbms57VeQIFeJH@db.edgitshcqelilcjkndho.supabase.co:5432/postgres?sslmode=disable
```

**Note**: The connection string includes SSL disabled for compatibility.

#### 4. **Configure Cron Job**
The `vercel.json` file is already configured for daily 9 AM execution:
```json
{
  "crons": [
    {
      "path": "/api/cron-daily-scraper",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### 📊 What Happens Daily at 9 AM

1. **🕘 9:00 AM**: Vercel triggers the cron job
2. **📡 API Calls**: Fetches 100 trending products with pagination
3. **💾 Database**: Stores products with rankings 1-100
4. **📈 Analytics**: Tracks GMV, views, engagement metrics
5. **📅 Date Tracking**: Each day gets its own dataset

### 🔍 Monitoring

#### **Check Cron Execution**
- Vercel Dashboard → Functions → View logs
- Check database for new daily data

#### **Manual Trigger**
```bash
curl -X POST https://your-app.vercel.app/api/cron-daily-scraper
```

#### **Database Queries**
```sql
-- Check daily data
SELECT collection_date, COUNT(*) as products, SUM(gmv) as total_gmv
FROM daily_trending_products 
GROUP BY collection_date 
ORDER BY collection_date DESC;

-- Top products today
SELECT ranking, product_name, gmv, views, units_sold
FROM daily_trending_products 
WHERE collection_date = CURDATE()
ORDER BY ranking
LIMIT 10;
```

### 📈 Expected Results

After deployment, you'll have:
- **✅ Daily Collection**: 100 trending products every day at 9 AM
- **✅ Historical Data**: Compare trends over time
- **✅ Rich Analytics**: GMV, views, engagement metrics
- **✅ Automatic Scaling**: Vercel handles all infrastructure

### 🛠️ Troubleshooting

#### **Cron Not Running**
1. Check Vercel Dashboard → Functions
2. Verify `vercel.json` configuration
3. Check environment variables

#### **Database Connection Issues**
1. Verify environment variables
2. Check Supabase server accessibility
3. Verify SSL configuration (disabled for compatibility)

#### **API Rate Limits**
1. Check TikTok API status
2. Verify authentication cookies
3. Monitor request frequency

### 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify database connectivity
3. Test API endpoints manually
4. Check environment variables

### 🎯 Success Metrics

- **Daily Products**: 100 products collected
- **Data Quality**: Complete product information
- **Reliability**: 99%+ uptime with Vercel
- **Performance**: Fast execution (< 2 minutes)

## 🚀 Ready to Deploy!

Your TikTok daily scraper is now ready for Vercel deployment with automatic daily execution at 9 AM! 🎉




