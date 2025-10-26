# 🛍️ Trending Products Scraper

An Apify actor that scrapes trending products from viral e-commerce platforms, providing comprehensive data about what's currently popular in social commerce.

## 🚀 Features

- **Real-time Trending Data**: Scrapes the latest trending products with rankings
- **Multiple Time Periods**: Choose from Today, Last 3 days, Last 7 days, or Last 30 days
- **Regional Support**: Scrape data for UK or US markets
- **Shop Filtering**: Optionally filter by specific shops
- **Enhanced Analytics**: Calculates trending scores, viral scores, and engagement metrics
- **Robust Error Handling**: Built-in retry logic and exponential backoff
- **Rate Limiting**: Respectful delays between requests

## 📊 Data Output

Each product includes:

### Basic Information
- `rank`: Product ranking position
- `product_id`: Unique product identifier
- `name`: Product name
- `price_value`: Numeric price value
- `price_display`: Formatted price string
- `product_img_url`: Product image URL
- `categories`: Array of product categories

### Sales Metrics
- `units_sold`: Number of units sold
- `gmv`: Gross Merchandise Value (revenue)
- `video_count`: Number of videos featuring this product
- `creator_count`: Number of creators who featured this product

### Shop Information
- `shop.shop_id`: Shop identifier
- `shop.shop_name`: Shop name
- `shop.shop_img_url`: Shop logo/image URL

### Calculated Metrics
- `trending_score`: Calculated trending score (0-100)
- `viral_score`: Calculated viral score (0-100)
- `revenue_per_video`: Revenue divided by video count
- `sales_per_creator`: Sales divided by creator count
- `engagement_rate`: Creator count divided by video count

### Metadata
- `region`: Geographic region (uk/us)
- `days_period`: Time period in days
- `scraped_at`: Timestamp when data was scraped

## 🛠️ Usage

### Input Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 12 | Maximum number of products to scrape (1-1000) |
| `offset` | integer | 0 | Starting offset for pagination |
| `days` | integer | 1 | Time period: 1, 3, 7, or 30 days |
| `region` | string | "uk" | Region: "uk" or "us" |
| `shopId` | string | null | Optional shop ID filter |
| `maxRetries` | integer | 3 | Maximum retry attempts (1-10) |
| `delayBetweenRequests` | integer | 1000 | Delay between requests in ms (100-10000) |

### Example Input

```json
{
  "limit": 50,
  "days": 7,
  "region": "us",
  "maxRetries": 5,
  "delayBetweenRequests": 2000
}
```

## 📈 Output Statistics

The actor provides summary statistics in the `OUTPUT` key:

```json
{
  "totalProducts": 50,
  "region": "us",
  "daysPeriod": 7,
  "scrapedAt": "2024-01-15T10:30:00.000Z",
  "topProduct": { /* top product data */ },
  "categories": ["Electronics", "Fashion", "Home"],
  "totalShops": 25
}
```

## 🎯 Use Cases

- **E-commerce Research**: Identify trending products for inventory decisions
- **Market Analysis**: Track product performance across different time periods
- **Competitor Analysis**: Monitor what's working for other shops
- **Content Creation**: Find trending products for social media content
- **Investment Research**: Identify high-performing product categories

## 🔧 Technical Details

- **Runtime**: Node.js 18+
- **Dependencies**: Apify SDK v3
- **Rate Limiting**: Configurable delays between requests
- **Error Handling**: Exponential backoff retry logic
- **Data Format**: JSON with comprehensive product metadata

## 📝 Notes

- The actor respects rate limits and includes appropriate delays
- All data is timestamped for tracking freshness
- Calculated metrics provide additional insights beyond raw data
- The actor handles pagination automatically for large datasets

## 🚨 Important

This actor is designed for research and analysis purposes. Please ensure compliance with the target platform's terms of service and implement appropriate rate limiting for production use.





