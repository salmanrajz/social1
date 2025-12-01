// Test direct TikTok API
const https = require('https');

function testDirectAPI() {
  const options = {
    hostname: 'tiktok.wakanz.com',
    port: 443,
    path: '/api/videos?region=uk&days=1&limit=5&offset=0',
    method: 'GET',
    headers: {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'cookie': '__Host-next-auth.csrf-token=64f312499e994880d224722ffc1b80687dad024564f0213cd5257f465bc0e83d%7C9a3cc9efff14182a7ea157bfa03a2e8d55f45fbc75817b56b7a8b85c0d4eff9b; __Secure-next-auth.callback-url=https%3A%2F%2Ftiktok.wakanz.com%2Fauth%2Fsignin%3FcallbackUrl%3Dhttps%253A%252F%252Ftiktok.wakanz.com%252F; site_password=Salman123!!!; site_expires=1760733199941; site_duration=30 minutes; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..x6C3qe2Te2pDbZrV.4t0_1UE-1f5xzFG6ZJppKN5b6tqQcEHKMUSItTEQUrCOliuqZ7nQpDDECmBCnS6Ip_kHxZl7X4wfcJP55ufsLp_UdszFk4pZfOQE567nrN9kjZIqM3UHsEjwNK-3ONZON9185aoroJn9strTFqzTjnJow149ydwZ4ioAtSc_eC_ADE0MuCsO6_5Mx3eQY1WlqF0qUkVF0CX85LTl8CzHPZAK8hiOguKAjYF1uOvDfwPACFLcEr4_qi-rjP8TKUmPkS4ndn7-r5UVbdrRmTYUVZg_gCqDZkX2yLykg2ykgJ4.Fkxj5zy__Q5KjmAdWV0V9Q',
      'priority': 'u=1, i',
      'referer': 'https://tiktok.wakanz.com/',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    }
  };

  console.log('🧪 Testing direct TikTok API...');
  console.log('📡 Making request to: https://tiktok.wakanz.com/api/videos');

  const req = https.request(options, (res) => {
    console.log(`📊 Response status: ${res.statusCode}`);
    console.log(`📊 Response headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ API Response received!');
        console.log(`📊 Results count: ${jsonData.results?.length || 0}`);
        
        if (jsonData.results && jsonData.results.length > 0) {
          console.log('\n🏆 First product:');
          const product = jsonData.results[0];
          console.log(`   Name: ${product.product_data?.name || 'Unknown'}`);
          console.log(`   GMV: £${(parseFloat(product.gmv) || 0).toLocaleString()}`);
          console.log(`   Views: ${(product.views || 0).toLocaleString()}`);
          console.log(`   Shop: ${product.product_data?.shop_name || 'Unknown'}`);
        }
        
      } catch (error) {
        console.error('❌ Parse error:', error.message);
        console.log('Raw response (first 200 chars):', data.substring(0, 200));
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });
  
  req.setTimeout(10000, () => {
    console.error('⏰ Request timeout');
    req.destroy();
  });
  
  req.end();
}

testDirectAPI();




