# 🔥 TikTok Viral Trends - Next.js App

A modern Next.js application for discovering trending TikTok videos and viral products. Built with a unique purple gradient theme and enhanced with custom viral metrics and engagement indicators.

## ✨ Features

### 🎬 Video Explorer
- **Viral Score Badge**: Custom algorithm calculating viral score (0-100) for each video
- **Engagement Bar**: Visual progress bar showing engagement rate percentage
- **Enhanced Stats**: Emoji-powered stats (👁️ Views, ❤️ Likes, 💬 Comments, 💰 Revenue)
- **Sponsored Badges**: Clear indicators for ad content
- **Advanced Filtering**: By region (US/UK), time period (1/3/7/30 days), content type (all/ads/non-ads)
- **Product Filtering**: View videos for specific products
- **Smart Pagination**: Smooth navigation through results

### 🛍️ Product Search & Discovery
- **Live Search**: Real-time results as you type (500ms debounce)
- **Trending Score**: Calculated trending score (0-100) for each product
- **Rich Product Cards**: Enhanced with emoji stats, shop info, and category hashtags
- **Interactive CTA**: Animated "View Trending Videos →" button
- **Product-to-Video Flow**: Seamless navigation from products to related videos

### 🏆 Top Products Page
- **Viral Rankings**: Top trending products ranked by performance
- **Store Filter**: Search and filter by store name
- **Category Filter**: Search products by category
- **Time Period Selection**: View top products from today, 3 days, 7 days, or 30 days
- **Region Support**: Filter by UK or US regions
- **Smart Pagination**: Browse through ranked products
- **Click-to-Videos**: Click any product to view its trending videos

### 🎨 Unique Design
- **Purple Gradient Theme**: Distinctive visual identity different from competitors
- **Animated Interactions**: Hover effects with purple glow and smooth transitions
- **Gradient Text Effects**: Eye-catching typography throughout
- **Responsive Design**: Optimized for all devices
- **Consumer-Friendly**: Trendy, approachable interface vs professional analytics tools

## API Integration

The application replicates your original curl request with full authentication:

```bash
curl 'https://www.social1.ai/api/videos/getTopVideos?limit=12&offset=0&days=1&region=us' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -b '_ga=GA1.1.1881742864.1759043181; __Secure-next-auth.session-token=...' \
  # ... (all original headers and cookies)
```

**Note**: The Social1 API requires authentication cookies to access the data. The application includes the necessary session tokens from your original request.

## Project Structure

```
social1/
├── app/
│   ├── api/
│   │   ├── videos/
│   │   │   └── route.js          # Video API route handler
│   │   ├── video-insights/
│   │   │   └── route.js          # Video insights API route
│   │   ├── products/
│   │   │   ├── search/
│   │   │   │   └── route.js      # Product search API route
│   │   │   └── top/
│   │   │       └── route.js      # Top products API route
│   │   ├── shops/
│   │   │   └── search/
│   │   │       └── route.js      # Shop search API route
│   │   ├── auth/
│   │   │   └── route.js          # Password authentication API
│   ├── search/
│   │   └── page.js               # Product search page
│   ├── products/
│   │   └── page.js               # Top products page
│   ├── auth/
│   │   └── page.js               # Password authentication page
│   ├── components/
│   │   ├── VideoCard.js          # Video card component
│   │   └── SessionTimer.js       # Session countdown timer
│   ├── globals.css               # Global styles
│   ├── layout.js                 # Root layout
│   └── page.js                   # Main page component
├── middleware.js                 # Password protection middleware
├── package.json                  # Dependencies
├── next.config.js               # Next.js configuration
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### GET /api/videos

Fetches videos from Social1 API with the following query parameters:

- `limit` (number): Number of results per page (default: 12)
- `offset` (number): Number of results to skip (default: 0)
- `days` (number): Time period in days (default: 1)
- `region` (string): Region code - 'us' or 'uk' (default: 'us')
- `productID` (string): Optional product ID to filter videos by specific product

**Examples:**
```
GET /api/videos?limit=12&offset=0&days=1&region=us
GET /api/videos?limit=12&offset=0&days=1&region=us&productID=1729400843827188280
```

### GET /api/products/search

Searches for products from Social1 API with the following query parameters:

- `query` (string): Search term for products (required)
- `region` (string): Region code - 'us' or 'uk' (default: 'us')

**Example:**
```
GET /api/products/search?query=socks&region=us
```

### GET /api/products/top

Fetches top viral products from Social1 API with the following query parameters:

- `limit` (number): Number of results per page (default: 12)
- `offset` (number): Page number (0-indexed) (default: 0)
- `days` (number): Time period in days (default: 1)
- `region` (string): Region code - 'us' or 'uk' (default: 'uk')

**Example:**
```
GET /api/products/top?limit=12&offset=0&days=1&region=uk
```

### GET /api/shops/search

Searches for TikTok shops from Social1 API with the following query parameters:

- `query` (string): Search term for shops (required)
- `region` (string): Region code - 'us' or 'uk' (default: 'uk')

**Example:**
```
GET /api/shops/search?query=beauty&region=uk
```

### GET /api/video-insights

Fetches detailed insights for a specific video from Social1 API:

- `videoID` (string): TikTok video ID (required)
- `region` (string): Region code - 'us' or 'uk' (default: 'us')

**Example:**
```
GET /api/video-insights?videoID=7556442101731364127&region=us
```

## Components

### VideoCard Component

Displays individual video information including:
- Video thumbnail with hover overlay
- Creator information (@handle)
- Video description
- Engagement stats (views, likes, comments, GMV)
- Product information (if available)
- Relative timestamp

### Main Page Features

- **Filter Controls**: Region, time period, and results per page selectors
- **Refresh Button**: Manual refresh capability
- **Pagination**: Previous/Next navigation with page indicator
- **Status Messages**: Loading, error, and empty state indicators
- **Responsive Grid**: Auto-adjusting video card layout

### Search Page Features

- **Live Search**: Real-time search as you type (with 500ms debounce)
- **Search Input**: Text input for product search queries
- **Region Filter**: US/UK region selection
- **Product Cards**: Detailed product information display with click-to-view functionality
- **Search Results**: Shows number of products found
- **Product Stats**: GMV, units sold, and category information
- **Product-to-Video Navigation**: Click any product card to view videos featuring that product
- **Loading Indicator**: Visual feedback while searching

### Product-to-Video Flow

- **Clickable Product Cards**: All product cards are clickable and redirect to videos
- **Product-Specific Videos**: Shows videos that feature the selected product
- **Clear Filter Button**: Easy way to return to all videos
- **Dynamic Header**: Shows which product ID is being viewed

## Styling

The application uses modern CSS with:
- CSS Grid for responsive layouts
- Flexbox for component alignment
- CSS custom properties for consistent theming
- Hover effects and transitions
- Mobile-first responsive design

## Data Format

The API returns video objects with the following structure:

```javascript
{
  video_id: "string",
  author_id: "string", 
  description: "string",
  time_posted: "YYYY-MM-DD HH:mm:ss",
  views: number,
  likes: number,
  comments: number,
  gmv: "string",
  handle: "string",
  video_username: "string",
  video_url: "string",
  thumbnail: "string",
  product_data: {
    name: "string",
    price_display: "string",
    shop_name: "string",
    img_url: "string",
    units_sold: number
  }
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment

- Node.js 18+
- Next.js 14
- React 18

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **Railway**
- **Docker**

## Original Files

The original vanilla JavaScript files have been preserved as backups:
- `app.js.backup` - Original JavaScript logic
- `index.html.backup` - Original HTML structure  
- `styles.css.backup` - Original CSS styles

## License

This project is for educational and development purposes.# social1
