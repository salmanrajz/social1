#!/bin/bash

# Social1.ai API Discovery Script
# This script tests potential API endpoints

COOKIE='_ga=GA1.1.1881742864.1759043181; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..QT0laU5AOAhYAg5o.VWJETykLfJPFy8mh6fSrW6df_iCk-bf-Y96ym1clw8WuHL3UTTI5Wm4nW2Ezr78i177A2-8sYbbngKxq-GwRl5c5XqxCpBUCDoIxypU007Ijq0TrkUAjolP3hZkw_W5w9Zct4BAUg4guAyz7ca2gbd2taR-SsLR3ElsE9QFoF1hAnfV-y-ZHdG9fmDfN9fErBGSkeb_Yq2P0P4Z56lAStlsjYk0ffc9c07mKveQKv6WatZ1xw5fE4lWlaTkXXY87ByMyfu9sYurgI-p9nohKU-Y5n5_j6rkYQwrlAhNLk3bKeHjtaxi7yB5qr9abJvuQGesJLF-EyRKM4qwvZ0KgqsbiZIM8yMQJWEAf1oiBFpiMRsWvMVNPJTaHxTI28w.T0j5xEdh5MN0pq-pOz26vg'

echo "🔍 Testing Social1.ai API Endpoints..."
echo "========================================"

# Test 1: Get Video Insights
echo -e "\n1️⃣ Testing: /api/videos/getVideoInsights"
curl -s 'https://www.social1.ai/api/videos/getVideoInsights?videoId=test' \
  -H "cookie: $COOKIE" \
  -H 'accept: */*' \
  -w "\nHTTP Status: %{http_code}\n" \
  | head -20

# Test 2: Get Product Details
echo -e "\n2️⃣ Testing: /api/products/getProductDetails"
curl -s 'https://www.social1.ai/api/products/getProductDetails?productId=1729643127889238552' \
  -H "cookie: $COOKIE" \
  -H 'accept: */*' \
  -w "\nHTTP Status: %{http_code}\n" \
  | head -20

# Test 3: Get Shop Details
echo -e "\n3️⃣ Testing: /api/shops/getShopDetails"
curl -s 'https://www.social1.ai/api/shops/getShopDetails?shopId=test' \
  -H "cookie: $COOKIE" \
  -H 'accept: */*' \
  -w "\nHTTP Status: %{http_code}\n" \
  | head -20

# Test 4: Get Trending Categories
echo -e "\n4️⃣ Testing: /api/categories/getTrending"
curl -s 'https://www.social1.ai/api/categories/getTrending?region=uk' \
  -H "cookie: $COOKIE" \
  -H 'accept: */*' \
  -w "\nHTTP Status: %{http_code}\n" \
  | head -20

# Test 5: Get Top Creators
echo -e "\n5️⃣ Testing: /api/creators/getTopCreators"
curl -s 'https://www.social1.ai/api/creators/getTopCreators?limit=10&region=uk' \
  -H "cookie: $COOKIE" \
  -H 'accept: */*' \
  -w "\nHTTP Status: %{http_code}\n" \
  | head -20

# Test 6: Get Product Analytics
echo -e "\n6️⃣ Testing: /api/products/getProductAnalytics"
curl -s 'https://www.social1.ai/api/products/getProductAnalytics?productId=1729643127889238552&days=7' \
  -H "cookie: $COOKIE" \
  -H 'accept: */*' \
  -w "\nHTTP Status: %{http_code}\n" \
  | head -20

# Test 7: Get Related Products
echo -e "\n7️⃣ Testing: /api/products/getRelated"
curl -s 'https://www.social1.ai/api/products/getRelated?productId=1729643127889238552' \
  -H "cookie: $COOKIE" \
  -H 'accept: */*' \
  -w "\nHTTP Status: %{http_code}\n" \
  | head -20

echo -e "\n✅ API Discovery Complete!"
echo "Check the results above for HTTP 200 responses"
