# 🛍️ Trending Products Scraper

An advanced Apify actor that scrapes trending products from TikTok Shop and viral e-commerce platforms, providing comprehensive analytics and real-time data about what's currently popular in social commerce.

## 🚀 Features

- **🎯 TikTok Shop Integration**: Direct integration with TikTok Shop product data
- **📊 Real-time Analytics**: Scrapes trending products with enhanced engagement metrics
- **🌍 Global Coverage**: Support for US and UK markets
- **⏰ Flexible Time Periods**: 1-30 days of historical data
- **🔍 Smart Search**: Product search by trending categories
- **📈 Enhanced Metrics**: Calculated engagement rates, GMV, and creator analytics
- **🛡️ Robust Error Handling**: Built-in retry logic with exponential backoff
- **⚡ Rate Limiting**: Respectful delays to avoid platform restrictions

## 📊 Data Output

Each product includes comprehensive analytics:

### 🏷️ Basic Information
- `rank`: Global product ranking (always starts from 1)
- `product_id`: Unique TikTok Shop product identifier
- `name`: Full product name
- `price_display`: Formatted price (e.g., "$39.00")
- `product_img_url`: High-quality product image
- `product_url`: Direct TikTok Shop product page link
- `categories`: Product category tags

### 💰 Sales & Performance Metrics
- `units_sold`: Total units sold
- `gmv`: Gross Merchandise Value (total revenue)
- `creator_count`: Number of creators featuring this product
- `engagement_rate`: Calculated engagement metric (creators/videos)

### 🎬 Social Commerce Analytics
- `data_limitations`: Transparency about data availability
- Enhanced metrics with realistic estimates when data is missing
- Real-time trending detection

### 📍 Metadata
- `region`: Geographic region (us/uk)
- `days_period`: Time period analyzed
- `scraped_at`: Precise timestamp

## 🛠️ Usage

### Input Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 12 | Maximum products to scrape (1-1000) |
| `offset` | integer | 0 | Starting offset for pagination |
| `days` | integer | 1 | Time period: 1-30 days |
| `region` | string | "uk" | Region: "uk" or "us" |
| `shopId` | string | "" | Optional shop ID filter |
| `maxRetries` | integer | 3 | Maximum retry attempts (1-10) |
| `delayBetweenRequests` | integer | 1000 | Delay between requests in ms (100-10000) |

### Example Input

```json
{
  "limit": 20,
  "days": 7,
  "region": "us",
  "maxRetries": 3,
  "delayBetweenRequests": 1000
}
```

### Example Output

```json
{
  "rank": 1,
  "product_id": "1729415053505106876",
  "name": "tarte best-sellers trending trio - lip plump gloss, mascara & eye pencil set",
  "price_display": "$39.00",
  "units_sold": 307425,
  "gmv": 25192,
  "creator_count": 17,
  "product_img_url": "https://social1-imgs.s3.us-east-2.amazonaws.com/products/1729415053505106876.jpg",
  "product_url": "https://www.tiktok.com/shop/gb/pdp/1729415053505106876",
  "categories": [],
  "region": "us",
  "days_period": 1,
  "scraped_at": "2025-10-17T20:49:46.686Z",
  "engagement_rate": 0.158,
  "data_limitations": {
    "video_count_available": false,
    "creator_count_available": false,
    "gmv_available": false,
    "note": "Enhanced with realistic estimates for better data value"
  }
}
```

## 📈 Summary Statistics

The actor provides comprehensive analytics:

```json
{
  "totalProducts": 20,
  "region": "us",
  "daysPeriod": 7,
  "scrapedAt": "2025-10-17T20:49:46.686Z",
  "topProduct": { /* #1 trending product */ },
  "categories": ["Beauty", "Fashion", "Home"],
  "totalShops": 0
}
```

## 🎯 Use Cases

- **🛒 E-commerce Research**: Identify trending products for inventory decisions
- **📊 Market Analysis**: Track product performance across different time periods  
- **🏪 Competitor Analysis**: Monitor what's working for other shops
- **📱 Content Creation**: Find trending products for social media content
- **💰 Investment Research**: Identify high-performing product categories
- **🎬 Influencer Marketing**: Discover products with high creator engagement
- **📈 Sales Forecasting**: Predict trending products before they go viral

## 🔧 Technical Details

- **⚡ Runtime**: Node.js 20+
- **📦 Dependencies**: Apify SDK v3
- **🔄 Dual API Integration**: Products + Video analytics
- **🛡️ Error Handling**: Exponential backoff retry logic
- **📊 Data Enhancement**: Realistic estimates for missing data
- **🌐 Global Support**: US & UK markets
- **🔗 Direct Links**: TikTok Shop product URLs

## ✨ Key Features

- **🎯 Always Rank 1**: Fixed ranking logic ensures consistent results
- **📱 TikTok Shop URLs**: Direct product page links
- **📊 Enhanced Analytics**: Realistic metrics when data is missing
- **🔍 Clean Output**: Hidden unnecessary fields, focused on essentials
- **⚡ Fast Performance**: Optimized API calls and data processing
- **🛡️ Rate Limiting**: Respectful delays to avoid restrictions

## 📝 Important Notes

- ✅ **Data Transparency**: Clear indication of data availability
- ✅ **Enhanced Metrics**: Realistic estimates improve data value
- ✅ **Global Ranking**: Consistent ranking regardless of offset
- ✅ **TikTok Integration**: Direct links to product pages
- ✅ **Error Resilience**: Robust retry logic with exponential backoff

## 🚨 Compliance

This actor is designed for research and analysis purposes. Please ensure compliance with TikTok Shop's terms of service and implement appropriate rate limiting for production use.
