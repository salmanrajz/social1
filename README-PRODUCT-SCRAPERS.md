# Product Scrapers Setup Guide

## 📋 Overview

Two new GitHub Actions have been created to scrape trending products from Social1.ai API:

1. **Daily Trending Products Scraper** - Runs daily at 9:00 AM UTC
2. **Monthly Trending Products Scraper** - Runs on the 1st of each month at 9:00 AM UTC

Both scrapers use the `/api/products/getTopProducts` endpoint and store data in Supabase.

## 📁 Files Created

### Scraper Scripts
- `github-action-product-daily-scraper.js` - Daily product scraper (days=1)
- `github-action-product-monthly-scraper.js` - Monthly product scraper (days=30)

### Database Tables
- `scripts/create-daily-trending-products-table.sql` - SQL for daily products table
- `scripts/create-monthly-trending-products-table.sql` - SQL for monthly products table

### GitHub Actions Workflows
- `.github/workflows/daily-product-scraper.yml` - Daily workflow
- `.github/workflows/monthly-product-scraper.yml` - Monthly workflow

## 🗄️ Database Setup

### Step 1: Create Tables in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Run the SQL scripts:

**For Daily Products:**
```sql
-- Copy and paste contents from scripts/create-daily-trending-products-table.sql
```

**For Monthly Products:**
```sql
-- Copy and paste contents from scripts/create-monthly-trending-products-table.sql
```

### Tables Created

#### `daily_trending_products_api`
- Stores daily trending products
- `collection_date`: DATE format (YYYY-MM-DD)
- Fetches products with `days=1`

#### `monthly_trending_products_api`
- Stores monthly trending products
- `collection_date`: VARCHAR(7) format (YYYY-MM)
- Fetches products with `days=30`

## 🚀 GitHub Actions Setup

### Prerequisites
- GitHub repository with Actions enabled
- `SUPABASE_KEY` secret already configured (same as video scrapers)

### Workflow Schedules

**Daily Scraper:**
- Runs: Every day at 9:00 AM UTC
- Cron: `0 9 * * *`
- Can be manually triggered via GitHub UI

**Monthly Scraper:**
- Runs: 1st day of each month at 9:00 AM UTC
- Cron: `0 9 1 * *`
- Can be manually triggered via GitHub UI

### Manual Testing

1. Go to: https://github.com/salmanrajz/social1/actions
2. Click on the workflow you want to test:
   - "Daily Trending Products Scraper"
   - "Monthly Trending Products Scraper"
3. Click "Run workflow" → "Run workflow"

## 📊 Data Structure

Each product record includes:

- **Basic Info:**
  - `product_id`: Unique product identifier
  - `product_name`: Product name
  - `price_value`: Numeric price
  - `price_display`: Formatted price string
  - `product_img_url`: Product image URL

- **Sales Metrics:**
  - `units_sold`: Number of units sold
  - `gmv`: Gross Merchandise Value
  - `video_count`: Number of videos featuring product
  - `creator_count`: Number of creators featuring product

- **Shop Info:**
  - `shop_name`: Shop name
  - `shop_id`: Shop identifier

- **Categories:**
  - `categories`: JSON array of categories

- **Metadata:**
  - `ranking`: Product ranking (1-240)
  - `region`: Geographic region (us/uk)
  - `collection_date`: Date/month of collection
  - `last_updated`: Timestamp

## 🔧 Configuration

### API Endpoint
- **URL:** `https://www.social1.ai/api/products/getTopProducts`
- **Parameters:**
  - `limit`: 12 (products per page)
  - `offset`: Pagination offset
  - `days`: 1 (daily) or 30 (monthly)
  - `region`: 'us' (default)

### Target Products
- Both scrapers target **240 products** total
- Fetches in pages of 12 products
- Maximum 50 pages (600 products max, then slices to 240)

## ✅ Verification

After running the scrapers, verify data in Supabase:

```sql
-- Check daily products
SELECT COUNT(*), collection_date, SUM(gmv) as total_gmv
FROM daily_trending_products_api
GROUP BY collection_date
ORDER BY collection_date DESC;

-- Check monthly products
SELECT COUNT(*), collection_date, SUM(gmv) as total_gmv
FROM monthly_trending_products_api
GROUP BY collection_date
ORDER BY collection_date DESC;
```

## 🔄 Updates Needed

The cookie in both scrapers may need to be updated periodically. To update:

1. Get a fresh cookie from your browser (logged into social1.ai)
2. Update the `COOKIE` constant in:
   - `github-action-product-daily-scraper.js`
   - `github-action-product-monthly-scraper.js`

## 📝 Notes

- Both scrapers use the same cookie and API endpoint
- Daily scraper uses `days=1`, monthly uses `days=30`
- Data is cleared and re-inserted for each collection date/month
- Retry logic handles network errors automatically
- 30-second timeout per request
- 2-second delay between requests to avoid rate limiting

## 🎯 Success Metrics

After successful runs, you should see:
- ✅ 240 products inserted per run
- ✅ Total GMV calculated and logged
- ✅ Total units sold calculated and logged
- ✅ Data stored in respective tables


