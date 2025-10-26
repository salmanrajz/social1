# Social1.ai API Discovery & Testing

## Currently Implemented APIs ✅

1. **Get Top Videos**
   - Endpoint: `https://www.social1.ai/api/videos/getTopVideos`
   - Parameters: `limit`, `offset`, `days`, `region`, `productID`
   - Status: ✅ Working

2. **Get Top Products**
   - Endpoint: `https://www.social1.ai/api/products/getTopProducts`
   - Parameters: `limit`, `offset`, `days`, `region`, `shopId`
   - Status: ✅ Working

3. **Search Products**
   - Endpoint: `https://www.social1.ai/api/products/search`
   - Parameters: `query`, `region`
   - Status: ✅ Working

4. **Search Shops**
   - Endpoint: `https://www.social1.ai/api/shops/search`
   - Parameters: `query`, `region`
   - Status: ✅ Working

---

## Potential APIs to Test 🔍

### High Priority (Likely to Exist):

1. **Get Video Details**
   - Potential: `https://www.social1.ai/api/videos/getVideoDetails`
   - Parameters: `videoId` or `videoUrl`
   - Use Case: Get detailed info about a specific video

2. **Get Product Details**
   - Potential: `https://www.social1.ai/api/products/getProductDetails`
   - Parameters: `productId`
   - Use Case: Get detailed info about a specific product

3. **Get Shop/Store Details**
   - Potential: `https://www.social1.ai/api/shops/getShopDetails`
   - Parameters: `shopId`
   - Use Case: Get detailed info about a specific shop

4. **Get Video Insights** (You mentioned this!)
   - Potential: `https://www.social1.ai/api/videos/getVideoInsights`
   - Parameters: `videoId`, `videoUrl`
   - Use Case: Get analytics/insights for a video

5. **Get Product Analytics**
   - Potential: `https://www.social1.ai/api/products/getProductAnalytics`
   - Parameters: `productId`, `days`
   - Use Case: Get historical performance data

6. **Get Trending Categories**
   - Potential: `https://www.social1.ai/api/categories/getTrending`
   - Parameters: `region`, `days`
   - Use Case: See which categories are trending

7. **Get Creator/Influencer Data**
   - Potential: `https://www.social1.ai/api/creators/getTopCreators`
   - Parameters: `limit`, `region`, `category`
   - Use Case: Find top performing creators

8. **Get Related Products**
   - Potential: `https://www.social1.ai/api/products/getRelated`
   - Parameters: `productId`
   - Use Case: Find similar/related products

9. **Get Product Price History**
   - Potential: `https://www.social1.ai/api/products/getPriceHistory`
   - Parameters: `productId`, `days`
   - Use Case: Track price changes over time

10. **Get Hashtag Analytics**
    - Potential: `https://www.social1.ai/api/hashtags/getTrending`
    - Parameters: `region`, `days`
    - Use Case: See trending hashtags

---

## Testing Strategy

### Method 1: Direct API Testing
```bash
# Test if endpoint exists
curl 'https://www.social1.ai/api/[ENDPOINT]?[PARAMS]' \
  -H 'cookie: [YOUR_COOKIE]' \
  -H 'accept: */*'
```

### Method 2: Browser Network Tab
1. Visit social1.ai
2. Open DevTools > Network tab
3. Navigate through the site
4. Look for API calls in the network log

### Method 3: Reverse Engineering
- Check social1.ai's JavaScript bundles
- Look for API endpoint patterns
- Inspect React component props

---

## Next Steps

1. ✅ Test the "getVideoInsights" endpoint (you mentioned this)
2. 🔍 Check browser network tab for additional endpoints
3. 📝 Document any new working endpoints
4. 🚀 Implement useful ones in our app

---

## Notes

- Social1.ai doesn't have public API documentation
- We're reverse-engineering their internal APIs
- Endpoints may change without notice
- Always include proper authentication cookies
- Respect rate limits and terms of service
