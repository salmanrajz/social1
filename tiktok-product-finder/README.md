# 🛍️ TikTok Product Finder

An advanced Apify actor for searching and analyzing TikTok Shop products with comprehensive market insights, trending scores, and business metrics.

## 🚀 Features

### Core Functionality
- **Advanced Product Search**: Search TikTok Shop products by keywords, categories, and filters
- **Comprehensive Analytics**: Detailed market analysis with trending scores, viral metrics, and business insights
- **Smart Filtering**: Filter by price range, trending score, units sold, and categories
- **Market Intelligence**: Competition analysis, growth potential, and risk assessment

### Data Points Analyzed
- **Sales Performance**: Units sold, revenue (GMV), conversion rates
- **Content Metrics**: Video count, creator count, engagement rates
- **Market Position**: Trending scores, viral potential, marketability
- **Business Intelligence**: ROI estimates, profit potential, break-even analysis
- **Competitive Analysis**: Market saturation, competition levels, differentiation potential

## 📊 Output Data Structure

### Basic Product Information
```json
{
  "product_id": "1729415053505106876",
  "name": "tarte best-sellers trending trio - lip plump gloss, mascara & eye pencil set",
  "description": "Complete beauty set with trending products",
  "price_value": 39.00,
  "price_display": "$39.00",
  "original_price": 49.00,
  "discount_percentage": 20
}
```

### Performance Metrics
```json
{
  "units_sold": 307425,
  "gmv": 26962,
  "video_count": 36,
  "creator_count": 12,
  "trending_score": 85,
  "viral_score": 78,
  "marketability_score": 92,
  "competition_score": 65,
  "overall_score": 87
}
```

### Market Analysis
```json
{
  "market_position": "popular-choice",
  "target_audience": {
    "primary": "beauty-enthusiasts",
    "demographics": ["18-35", "beauty-conscious"],
    "interests": ["beauty", "skincare", "makeup"]
  },
  "seasonal_trends": ["spring", "summer"],
  "growth_potential": {
    "score": 78,
    "level": "high",
    "factors": ["trending-momentum", "category-growth"]
  }
}
```

### Business Intelligence
```json
{
  "profit_potential": {
    "profit_per_unit": 23.40,
    "total_profit": 7193691,
    "profit_margin": 60,
    "cost_estimate": 15.60
  },
  "roi_estimate": {
    "roi_percentage": 233,
    "payback_period_days": 15,
    "investment_required": 2158107
  },
  "break_even_analysis": {
    "break_even_units": 667,
    "break_even_revenue": 26013,
    "break_even_days": 67
  }
}
```

## 🔧 Configuration

### Required Parameters
- **query** (string): Search term or keywords

### Optional Parameters
- **region** (string): 'us' or 'uk' (default: 'us')
- **limit** (integer): Maximum results (default: 50, max: 200)
- **includeDetails** (boolean): Include detailed analytics (default: true)
- **minTrendingScore** (integer): Minimum trending score filter (0-100)
- **minUnitsSold** (integer): Minimum units sold filter
- **category** (string): Category filter (e.g., 'beauty', 'electronics')
- **priceRange** (object): Min/max price filter
- **maxRetries** (integer): Retry attempts (default: 3)
- **delayBetweenRequests** (integer): Request delay in ms (default: 1000)

## 📈 Use Cases

### 1. Product Research
```javascript
{
  "query": "wireless headphones",
  "region": "us",
  "minTrendingScore": 70,
  "priceRange": {
    "min": 50,
    "max": 200
  }
}
```

### 2. Market Analysis
```javascript
{
  "query": "skincare",
  "region": "us",
  "includeDetails": true,
  "category": "beauty",
  "limit": 100
}
```

### 3. Competitive Intelligence
```javascript
{
  "query": "fitness gear",
  "region": "uk",
  "minUnitsSold": 1000,
  "includeDetails": true
}
```

### 4. Trend Discovery
```javascript
{
  "query": "home decor",
  "region": "us",
  "minTrendingScore": 80,
  "limit": 25
}
```

## 🎯 Scoring System

### Trending Score (0-100)
- **Sales Performance** (40%): Units sold and revenue
- **Content Activity** (20%): Video count and creator engagement
- **Revenue Performance** (25%): Gross merchandise value
- **Creator Diversity** (15%): Number of unique creators

### Viral Score (0-100)
- **Sales per Video**: Conversion efficiency
- **Creator Diversity**: Content variety
- **Content Volume**: Video frequency

### Marketability Score (0-100)
- **Price Competitiveness** (30%): Market positioning
- **Category Popularity** (25%): Market demand
- **Sales Volume** (25%): Market validation
- **Brand Recognition** (20%): Market presence

### Competition Score (0-100)
- **Creator Count**: Market saturation
- **Video Count**: Content competition
- **Category Competition**: Market density

## 📊 Market Insights

The actor provides comprehensive market insights including:

- **Market Summary**: Average prices, trending scores, sales volumes
- **Top Categories**: Most popular product categories
- **Market Opportunities**: Price gaps, category gaps, trending potential
- **Risk Assessment**: Low sales, high competition, unclear positioning
- **Growth Potential**: Sales velocity, market saturation, expansion opportunities

## 🔍 Advanced Analytics

When `includeDetails` is enabled, additional analytics include:

- **Sales Velocity**: Daily, weekly, monthly sales trends
- **Price Elasticity**: Market sensitivity to price changes
- **Competitor Analysis**: Competition levels and market saturation
- **Market Saturation**: Content density and market maturity
- **Growth Potential**: Expansion opportunities and market gaps
- **Risk Assessment**: Potential challenges and market risks

## 🖼️ Actor Image

The actor includes professional SVG images for branding and presentation:
- `actor-image.svg` - Full-featured 800x600 image for detailed presentation
- `actor-icon.svg` - Compact 512x512 icon version for Apify platform

Both images feature:
- TikTok-inspired gradient background
- Professional card-based design
- Feature highlights and branding
- High-quality SVG format for scalability

## 🚀 Getting Started

1. **Deploy the Actor**: Upload to Apify platform
2. **Configure Input**: Set your search parameters
3. **Run the Actor**: Execute with your desired configuration
4. **Analyze Results**: Review comprehensive product and market data
5. **Export Data**: Download results in JSON format

## 📝 Example Output

The actor returns structured data with:
- Individual product records with detailed analytics
- Market summary statistics
- Category breakdowns
- Shop information
- Performance metrics
- Business intelligence
- Risk assessments

## 🔧 Technical Details

- **Runtime**: Node.js 18+
- **Dependencies**: Apify SDK v3
- **API Source**: Social1.ai TikTok Shop data
- **Rate Limiting**: Configurable delays between requests
- **Error Handling**: Automatic retries with exponential backoff
- **Data Quality**: Quality scoring for each product

## 📞 Support

For issues, questions, or feature requests:
- Create an issue on GitHub
- Contact the Social1 team
- Check the Apify documentation

---

**Built with ❤️ by the Social1 Team**
