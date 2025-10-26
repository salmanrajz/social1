// Test the daily scraper with Supabase
const https = require('https');
const { Pool } = require('pg');

// Database configuration for Supabase PostgreSQL
const DB_CONFIG = {
  connectionString: 'postgresql://postgres:ItNbms57VeQIFeJH@db.edgitshcqelilcjkndho.supabase.co:5432/postgres?sslmode=disable',
  ssl: false
};

// Create PostgreSQL connection pool
function createConnection() {
  return new Pool(DB_CONFIG);
}

// Fetch single page from direct API
async function fetchPage(offset, limit) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'tiktok.wakanz.com',
      port: 443,
      path: `/api/videos?region=uk&days=1&limit=${limit}&offset=${offset}`,
      method: 'GET',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': '__Host-next-auth.csrf-token=64f312499e994880d224722ffc1b80687dad024564f0213cd5257f465bc0e83d%7C9a3cc9efff14182a7ea157bfa03a2e8d55f45fbc75817b56b7a8b85c0d4eff9b; __Secure-next-auth.callback-url=https%3A%2F%2Ftiktok.wakanz.com%2Fauth%2Fsignin%3FcallbackUrl%3Dhttps%253A%252F%252Ftiktok.wakanz.com%252F; site_password=777888; site_expires=1760894073430; site_duration=30 minutes; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Xn9xPJ2kggvCrTTz.03Dbq0fYI_Nuc6PlrSDiezbhLOQYE8WK9vHC9OaQJC5b_zabEyL_ScFeE9ij5SwxVejn6fb_MWaUuCLox9I-2leICzwY1xP7snKHIvCAwqLHamfZC4siWYwYQpSVWM4vQURgTS41QD89I4WNOrdwCumqTAZDOz229Uyu_g8WiXKv_-QJY88iI15mzWjwBqeYVQFBmDLKUOzzxxWFChb8TOlKPG-sxs86Qdbsc4lRfQQxAxjc39E2d9dZH4lFnM-WxdUxvT_JqWP4JvPGEGzartQgEnWIDV_AEnF95mTHE5Q.8y_n-f6a4r5bbP-Xz6TqFw',
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

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          const products = jsonData.results || [];
          resolve(products);
        } catch (error) {
          console.error(`❌ Parse error page ${Math.floor(offset/limit) + 1}:`, error.message);
          resolve([]);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error page ${Math.floor(offset/limit) + 1}:`, error.message);
      resolve([]);
    });
    
    req.setTimeout(15000, () => {
      console.error(`⏰ Timeout page ${Math.floor(offset/limit) + 1}`);
      req.destroy();
      resolve([]);
    });
    
    req.end();
  });
}

// Test scraper with Supabase
async function testScraper() {
  try {
    console.log('🧪 Testing TikTok Scraper with Supabase...');
    
    // Test API connection
    console.log('📡 Testing API connection...');
    const products = await fetchPage(0, 5); // Get just 5 products for testing
    
    if (products.length === 0) {
      console.log('❌ No products received from API');
      return;
    }
    
    console.log(`✅ Received ${products.length} products from API`);
    console.log(`📊 Sample product ranking: ${products[0].ranking}`);
    console.log(`💰 Sample product GMV: £${products[0].gmv}`);
    
    // Test database connection
    console.log('\n🗄️ Testing database connection...');
    const pool = createConnection();
    
    // Test insert one product
    const testProduct = products[0];
    const today = new Date().toISOString().split('T')[0];
    
    const insertSQL = `
      INSERT INTO daily_trending_products (
        collection_date, ranking, video_id, video_url, video_description, video_username,
        handle, author_id, thumbnail, comments, views, likes, gmv, video_count,
        creator_count, view_gain, product_id, product_name, price_value, price_display,
        units_sold, product_img_url, shop_name, shop_id, top_category, categories,
        insights, transcription, reading_level, time_posted, is_ad, has_error,
        has_scraped, attempts, scrape_frequency, last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
      ON CONFLICT (collection_date, ranking) DO UPDATE SET
        video_id = EXCLUDED.video_id,
        gmv = EXCLUDED.gmv,
        last_updated = EXCLUDED.last_updated
    `;
    
    const values = [
      today,
      testProduct.ranking || 0,
      testProduct.video_id || '',
      testProduct.video_url || '',
      testProduct.video_description || '',
      testProduct.video_username || '',
      testProduct.handle || '',
      testProduct.author_id || '',
      testProduct.thumbnail || '',
      testProduct.comments || 0,
      testProduct.views || 0,
      testProduct.likes || 0,
      parseFloat(testProduct.gmv) || 0,
      testProduct.video_count || 0,
      testProduct.creator_count || 0,
      parseFloat(testProduct.view_gain) || 0,
      testProduct.product_data?.product_id || '',
      testProduct.product_data?.name || '',
      parseFloat(testProduct.product_data?.price_value) || 0,
      testProduct.product_data?.price_display || '',
      testProduct.product_data?.units_sold || 0,
      testProduct.product_data?.img_url || '',
      testProduct.product_data?.shop_name || '',
      testProduct.product_data?.shop_id || '',
      testProduct.top_category || '',
      JSON.stringify(testProduct.product_data?.categories || []),
      JSON.stringify(testProduct.insights || []),
      JSON.stringify(testProduct.transcription || {}),
      testProduct.transcription?.reading_level || '',
      testProduct.time_posted ? new Date(testProduct.time_posted) : null,
      testProduct.is_ad || false,
      testProduct.has_error || false,
      testProduct.has_scraped || true,
      testProduct.attempts || 0,
      testProduct.scrape_frequency || 4,
      testProduct.last_updated ? new Date(testProduct.last_updated) : new Date()
    ];
    
    await pool.query(insertSQL, values);
    console.log('✅ Test product inserted successfully!');
    
    // Verify the data
    const verifyResult = await pool.query(
      'SELECT ranking, product_name, gmv FROM daily_trending_products WHERE collection_date = $1 ORDER BY ranking LIMIT 5',
      [today]
    );
    
    console.log('\n📊 Current data in database:');
    verifyResult.rows.forEach(row => {
      console.log(`  Rank ${row.ranking}: ${row.product_name} - £${row.gmv}`);
    });
    
    await pool.end();
    
    console.log('\n🎉 Test completed successfully! Ready for Vercel deployment.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testScraper();
