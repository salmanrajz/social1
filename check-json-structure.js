// Check actual JSON structure from API
const https = require('https');

function checkJSONStructure() {
  const options = {
    hostname: 'tiktok.wakanz.com',
    port: 443,
    path: '/api/videos?region=uk&days=1&limit=3&offset=0',
    method: 'GET',
    headers: {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'cookie': '__Host-next-auth.csrf-token=64f312499e994880d224722ffc1b80687dad024564f0213cd5257f465bc0e83d%7C9a3cc9efff14182a7ea157bfa03a2e8d55f45fbc75817b56b7a8b85c0d4eff9b; __Secure-next-auth.callback-url=https%3A%2F%2Ftiktok.wakanz.com%2Fauth%2Fsignin%3FcallbackUrl%3Dhttps%253A%252F%252Ftiktok.wakanz.com%252F; site_password=Salman123!!!; site_expires=1760894073430; site_duration=30 minutes; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Xn9xPJ2kggvCrTTz.03Dbq0fYI_Nuc6PlrSDiezbhLOQYE8WK9vHC9OaQJC5b_zabEyL_ScFeE9ij5SwxVejn6fb_MWaUuCLox9I-2leICzwY1xP7snKHIvCAwqLHamfZC4siWYwYQpSVWM4vQURgTS41QD89I4WNOrdwCumqTAZDOz229Uyu_g8WiXKv_-QJY88iI15mzWjwBqeYVQFBmDLKUOzzxxWFChb8TOlKPG-sxs86Qdbsc4lRfQQxAxjc39E2d9dZH4lFnM-WxdUxvT_JqWP4JvPGEGzartQgEnWIDV_AEnF95mTHE5Q.8y_n-f6a4r5bbP-Xz6TqFw',
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

  console.log('🔍 Checking actual JSON structure from API...');

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ JSON parsed successfully');
        console.log('\n📊 Top level keys:', Object.keys(jsonData));
        
        if (jsonData.results && Array.isArray(jsonData.results)) {
          console.log(`\n📋 Results array length: ${jsonData.results.length}`);
          
          if (jsonData.results.length > 0) {
            const firstProduct = jsonData.results[0];
            console.log('\n🔍 First product keys:', Object.keys(firstProduct));
            console.log('\n📝 First product sample:');
            console.log('  video_id:', firstProduct.video_id);
            console.log('  ranking:', firstProduct.ranking);
            console.log('  gmv:', firstProduct.gmv);
            console.log('  product_data:', firstProduct.product_data ? Object.keys(firstProduct.product_data) : 'null');
            
            if (firstProduct.product_data) {
              console.log('  product_name:', firstProduct.product_data.name);
              console.log('  product_id:', firstProduct.product_data.product_id);
            }
          }
        } else {
          console.log('❌ No results array found');
        }
        
      } catch (error) {
        console.error('❌ Parse error:', error.message);
        console.log('Raw response (first 500 chars):', data.substring(0, 500));
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

checkJSONStructure();




