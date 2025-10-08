# Social1.ai API Reference

## 🎯 Confirmed & Implemented APIs

### 1. Get Top Videos
**Endpoint**: `GET /api/videos/getTopVideos`

**Parameters**:
- `limit` (number): Results per page (default: 12)
- `offset` (number): Page number, 0-indexed (default: 0)
- `days` (number): Time period - 1, 3, 7, 30 (default: 1)
- `region` (string): 'us' or 'uk' (default: 'us')
- `productID` (string, optional): Filter by specific product
- `date` (string, optional): Specific date filter (format: YYYY_MM_DD)
- `shift_date` (boolean, optional): Whether to shift date (default: false)

**Response**: Object with:
- results: Array of video objects
  - video_id, author_id, handle, video_username
  - description, time_posted
  - views, likes, comments, shares
  - gmv (revenue)
  - thumbnail, video_url
  - product_data (if available)
  - is_ad (boolean)
- page, has_more

**Status**: ✅ Implemented in `/app/api/videos/route.js`

---

### 2. Get Video Insights
**Endpoint**: `GET /api/videos/getVideoInsights`

**Parameters**:
- `videoID` (string): TikTok video ID (required)
- `region` (string): 'us' or 'uk' (default: 'us')

**Response**: Detailed video analytics (AI-powered insights)

**Status**: ✅ Implemented in `/app/api/video-insights/route.js`

**Notes**: This API is used when clicking "AI Insights" button on videos. Costs user credits.

---

### 3. Get Top Products
**Endpoint**: `GET /api/products/getTopProducts`

**Parameters**:
- `limit` (number): Results per page (default: 12)
- `offset` (number): Page number, 0-indexed (default: 0)
- `days` (number): Time period - 1, 3, 7, 30 (default: 1)
- `region` (string): 'us' or 'uk' (default: 'uk')
- `shopId` (string, optional): Filter by specific shop

**Response**: Object with:
- results: Array of product objects
  - product_id, name, categories
  - price_value, price_display
  - units_sold, gmv (revenue)
  - video_count, creator_count
  - product_img_url
  - shop: { shop_id, shop_name, shop_img_url }
- page, has_more

**Status**: ✅ Implemented in `/app/api/products/top/route.js`

---

### 4. Search Products
**Endpoint**: `GET /api/products/search`

**Parameters**:
- `query` (string): Search term (required)
- `region` (string): 'us' or 'uk' (default: 'us')

**Response**: Object with:
- results: Array of product objects (similar to getTopProducts)

**Status**: ✅ Implemented in `/app/api/products/search/route.js`

---

### 5. Search Shops
**Endpoint**: `GET /api/shops/search`

**Parameters**:
- `query` (string): Search term (required, min 2 characters)
- `region` (string): 'us' or 'uk' (default: 'uk')

**Response**: Object with:
- results: Array of shop objects
  - shop_id, shop_name
  - shop_img_url
  - product_count (optional)

**Status**: ✅ Implemented in `/app/api/shops/search/route.js`

---

### 6. Get User Credits
**Endpoint**: `GET /api/user/credits`

**Parameters**: None (uses session cookies)

**Response**: Object with user credit information

**Status**: ⚠️ Discovered, not yet implemented

**Notes**: This API is called on page load to check user's remaining credits.

---

### 7. User Analytics (PostHog)
**Endpoint**: `POST /api/user/posthog`

**Parameters**: Tracking data (body)

**Response**: Success response

**Status**: ⚠️ Discovered, not yet implemented

**Notes**: This API is used for user behavior analytics.

---

### 8. Auth Session
**Endpoint**: `GET /api/auth/session`

**Parameters**: None (uses session cookies)

**Response**: User session data

**Status**: ⚠️ Discovered, not yet implemented

**Notes**: Next-Auth session endpoint to check user authentication status.

---

## 🔍 APIs to Investigate (Potential)

Based on Social1.ai's features, these endpoints might exist:

### 1. Creator/Influencer APIs
- **Get Top Creators**
  - `/api/creators/getTopCreators?limit=12&offset=0&days=1&region=us`
  - Similar structure to getTopVideos

- **Get Creator Profile**
  - `/api/creators/getProfile?creatorId=xxx` or `handle=xxx`
  - Detailed creator stats and videos

- **Get Creator Videos**
  - `/api/videos/getByCreator?creatorId=xxx&limit=12&offset=0`
  - All videos from a specific creator

### 2. Product Details & History
- **Get Product Details**
  - `/api/products/getDetails?productId=xxx&region=us`
  - Detailed product information

- **Get Product History/Trends**
  - `/api/products/getTrends?productId=xxx&days=30`
  - Historical data for product performance

- **Get Product Videos**
  - `/api/videos/getByProduct?productId=xxx&limit=12&offset=0`
  - All videos featuring a product (already have this via `productID` param)

### 3. Shop Details
- **Get Shop Details**
  - `/api/shops/getDetails?shopId=xxx&region=us`
  - Detailed shop information

- **Get Shop Products**
  - `/api/shops/getProducts?shopId=xxx&limit=12&offset=0`
  - All products from a shop (already have via `shopId` param in getTopProducts)

### 4. Categories & Niches
- **Get Categories**
  - `/api/categories/list?region=us`
  - List of available product categories

- **Get Products by Category**
  - `/api/products/getByCategory?category=xxx&limit=12&offset=0`
  - Products filtered by category

- **Get Trending Niches**
  - `/api/niches/getTrending?days=7&region=us`
  - Trending product categories

### 5. Lists & Saved Items
- **Get User Lists**
  - `/api/lists/get`
  - User's saved lists

- **Save to List**
  - `POST /api/lists/save`
  - Save product/video to list

- **Remove from List**
  - `DELETE /api/lists/remove`
  - Remove item from list

### 6. Transcription
- **Get Video Transcript**
  - `/api/videos/getTranscript?videoId=xxx`
  - Video transcription

---

## 🔐 Authentication

All endpoints require cookies:
- `__Secure-next-auth.session-token` (required, expires periodically)
- `__Host-next-auth.csrf-token` (required)
- `__Secure-next-auth.callback-url` (required)
- `_ga`, `_ga_KW1C8BH7Q1` (Google Analytics, optional)
- `ph_phc_LvsHwkuAh5ZkWAADNlrGGfG14aaUsBNwOckji9YooKX_posthog` (PostHog, optional)

**Session Token Management**:
- Session tokens expire after a period of inactivity
- Need to be refreshed periodically
- When a token expires, all API calls return 401 Unauthorized

---

## ⚡ Rate Limits & Credits

- **AI Insights**: Costs user credits per request
- **Standard APIs**: Unknown rate limits, likely based on user plan
- **Session-based throttling**: Possible per-session limits

---

## 📊 Common Response Patterns

### Pagination Response
```json
{
  "results": [...],
  "page": 0,
  "has_more": true
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

---

## 🎯 Next Steps

1. ✅ Document all confirmed APIs
2. ⏳ Test potential creator/influencer endpoints
3. ⏳ Test category and niche endpoints
4. ⏳ Test lists/saved items endpoints
5. ⏳ Implement additional APIs as needed

---

## 📝 Notes

- All APIs return JSON
- Timestamps are in Unix format (seconds since epoch)
- Product IDs and Video IDs are long integers as strings
- Shop IDs are long integers as strings
- Currency is USD by default
- Numbers (views, likes, etc.) are integers
- Images are hosted on TikTok CDN or S3
