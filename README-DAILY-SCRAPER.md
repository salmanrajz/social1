# Daily Trending Products Scraper

## 🎯 Overview
This system automatically scrapes TikTok trending products daily at 9 AM and stores them in MySQL for historical analysis and trend comparison.

## 📊 Features
- **Daily Collection**: Fetches top 100 trending products every day
- **Historical Analysis**: Compare trends between different dates
- **Rich Data**: Stores video metrics, product details, engagement data
- **Automated**: Runs daily at 9 AM via cron job

## 🗄️ Database Structure

### Table: `daily_trending_products`
```sql
CREATE TABLE daily_trending_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  collection_date DATE NOT NULL,
  ranking INT NOT NULL,
  
  -- Video metrics
  video_id VARCHAR(50) NOT NULL,
  video_url TEXT,
  video_description TEXT,
  video_username VARCHAR(100),
  handle VARCHAR(100),
  author_id VARCHAR(50),
  thumbnail TEXT,
  
  -- Engagement metrics
  comments INT DEFAULT 0,
  views BIGINT DEFAULT 0,
  likes INT DEFAULT 0,
  gmv DECIMAL(15,2) DEFAULT 0,
  video_count INT DEFAULT 0,
  creator_count INT DEFAULT 0,
  view_gain DECIMAL(15,2) DEFAULT 0,
  
  -- Product data
  product_id VARCHAR(50),
  product_name TEXT,
  price_value DECIMAL(10,2),
  price_display VARCHAR(50),
  units_sold INT DEFAULT 0,
  product_img_url TEXT,
  
  -- Shop data
  shop_name VARCHAR(200),
  shop_id VARCHAR(50),
  
  -- Categories
  top_category VARCHAR(100),
  categories TEXT,
  
  -- Content analysis
  insights TEXT,
  transcription TEXT,
  reading_level VARCHAR(20),
  
  -- Metadata
  time_posted DATETIME,
  is_ad BOOLEAN DEFAULT FALSE,
  has_error BOOLEAN DEFAULT FALSE,
  has_scraped BOOLEAN DEFAULT TRUE,
  attempts INT DEFAULT 0,
  scrape_frequency INT DEFAULT 4,
  last_updated DATETIME,
  
  -- Indexes
  INDEX idx_collection_date (collection_date),
  INDEX idx_ranking (ranking),
  INDEX idx_product_id (product_id),
  INDEX idx_gmv (gmv)
);
```

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install mysql2
```

### 2. Database Configuration
Update the database credentials in the script:
```javascript
const DB_CONFIG = {
  host: 'chatvocusdb.mysql.database.azure.com',
  port: 3306,
  user: 'duquickpay',
  password: '@Xuj0324!!!',
  database: 'neweticrm',
  ssl: { rejectUnauthorized: false }
};
```

### 3. Test Database Connection
```bash
node test-db-connection.js
```

### 4. Run Scraper Manually
```bash
node daily-scraper-simple.js
```

### 5. Setup Daily Cron Job
```bash
# Add to crontab for 9 AM daily
0 9 * * * cd /path/to/project && node daily-scraper-simple.js >> /var/log/daily-scraper.log 2>&1
```

## 📈 Usage Examples

### Daily Data Collection
```bash
# Run manually
node daily-scraper-simple.js
```

### Compare Trends Between Dates
```sql
-- Compare Oct 20th vs Oct 19th
SELECT 
  d1.ranking as oct20_rank,
  d1.product_name,
  d1.gmv as oct20_gmv,
  d2.ranking as oct19_rank,
  d2.gmv as oct19_gmv,
  (d1.ranking - d2.ranking) as rank_change,
  (d2.gmv - d1.gmv) as gmv_change
FROM daily_trending_products d1
LEFT JOIN daily_trending_products d2 ON d1.product_id = d2.product_id AND d2.collection_date = '2025-01-19'
WHERE d1.collection_date = '2025-01-20'
ORDER BY d1.ranking
LIMIT 20;
```

### Get Top Products for Specific Date
```sql
SELECT ranking, product_name, gmv, views, units_sold, shop_name
FROM daily_trending_products 
WHERE collection_date = '2025-01-20'
ORDER BY ranking
LIMIT 10;
```

### Track Product Performance Over Time
```sql
SELECT collection_date, ranking, gmv, views, units_sold
FROM daily_trending_products 
WHERE product_id = '1729429945255235389'
ORDER BY collection_date;
```

## 🕘 Cron Job Setup

### Manual Setup
```bash
# Edit crontab
crontab -e

# Add this line for 9 AM daily
0 9 * * * cd /Users/salman/Documents/projects/social1 && node daily-scraper-simple.js >> /var/log/daily-scraper.log 2>&1
```

### Automated Setup
```bash
node setup-cron.js setup
```

## 📊 Data Analysis Queries

### Top Performing Products
```sql
SELECT 
  product_name,
  AVG(gmv) as avg_gmv,
  COUNT(*) as days_trending,
  MAX(ranking) as best_rank
FROM daily_trending_products 
GROUP BY product_id, product_name
HAVING COUNT(*) >= 3
ORDER BY avg_gmv DESC
LIMIT 20;
```

### Category Performance
```sql
SELECT 
  top_category,
  COUNT(*) as total_products,
  AVG(gmv) as avg_gmv,
  SUM(units_sold) as total_units_sold
FROM daily_trending_products 
WHERE collection_date = '2025-01-20'
GROUP BY top_category
ORDER BY avg_gmv DESC;
```

### Rising Products
```sql
SELECT 
  product_name,
  d1.ranking as current_rank,
  d2.ranking as previous_rank,
  (d2.ranking - d1.ranking) as rank_improvement
FROM daily_trending_products d1
JOIN daily_trending_products d2 ON d1.product_id = d2.product_id 
WHERE d1.collection_date = '2025-01-20' 
  AND d2.collection_date = '2025-01-19'
  AND d1.ranking < d2.ranking
ORDER BY rank_improvement DESC;
```

## 🔧 Troubleshooting

### Database Connection Issues
1. Check credentials in `DB_CONFIG`
2. Verify database server is accessible
3. Test connection with `node test-db-connection.js`

### API Issues
1. Ensure Next.js server is running on port 3001
2. Check API endpoint: `http://localhost:3001/api/videos`
3. Verify authentication cookies are valid

### Cron Job Issues
1. Check cron logs: `tail -f /var/log/daily-scraper.log`
2. Verify file paths in cron job
3. Test manual execution first

## 📝 Logs and Monitoring

### View Daily Logs
```bash
tail -f /var/log/daily-scraper.log
```

### Check Cron Job Status
```bash
crontab -l
```

### Monitor Database Growth
```sql
SELECT 
  collection_date,
  COUNT(*) as products_count,
  SUM(gmv) as total_gmv
FROM daily_trending_products 
GROUP BY collection_date
ORDER BY collection_date DESC;
```

## 🎯 Expected Results

After setup, you'll have:
- **Daily Data**: Top 100 trending products every day
- **Historical Tracking**: Compare trends over time
- **Rich Analytics**: GMV, views, engagement metrics
- **Trend Analysis**: Rising/falling products
- **Category Insights**: Performance by product category

## 📞 Support

If you encounter issues:
1. Check database connection first
2. Verify API is working: `curl http://localhost:3001/api/videos`
3. Test manual execution before setting up cron
4. Check logs for specific error messages




