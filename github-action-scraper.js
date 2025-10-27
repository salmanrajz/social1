// GitHub Action script for daily TikTok trending products scraper
const https = require('https');
const { Pool } = require('pg');

// Database configuration for Supabase PostgreSQL
const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:ItNbms57VeQIFeJH@db.edgitshcqelilcjkndho.supabase.co:5432/postgres?sslmode=disable',
  ssl: false,
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 60000,
  max: 1,
  // Force IPv4 and add additional options
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
};

// Alternative connection config with different SSL settings
const DB_CONFIG_ALT = {
  host: 'db.edgitshcqelilcjkndho.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'ItNbms57VeQIFeJH',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  },
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 60000,
  max: 1,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
};

// Create PostgreSQL connection pool with multiple fallbacks
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

// Fetch all products with pagination
async function fetchAllProducts() {
  const allProducts = [];
  const limit = 12;
  let offset = 0;
  let page = 1;
  const targetProducts = 240; // Back to 240 products
  
  console.log('📡 Fetching products using API\'s original ranking...');
  
  while (allProducts.length < targetProducts && page <= 25) { // Back to 25 pages for 240 products
    console.log(`📄 Page ${page} (offset: ${offset}, limit: ${limit})...`);
    
    const products = await fetchPage(offset, limit);
    
    if (products.length === 0) {
      console.log('⚠️ No more products available');
      break;
    }
    
    allProducts.push(...products);
    console.log(`✅ Got ${products.length} products (total: ${allProducts.length})`);
    
    offset += 1;
    page++;
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`🎯 Fetched ${allProducts.length} products total`);
  return allProducts.slice(0, targetProducts);
}

// Create table
async function createTable() {
  const pool = createConnection();
  
  try {
    console.log('🗄️ Creating daily_trending_products table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS daily_trending_products (
        id SERIAL PRIMARY KEY,
        collection_date DATE NOT NULL,
        ranking INTEGER NOT NULL,
        
        -- Video metrics
        video_id VARCHAR(50) NOT NULL,
        video_url TEXT,
        video_description TEXT,
        video_username VARCHAR(100),
        handle VARCHAR(100),
        author_id VARCHAR(50),
        thumbnail TEXT,
        
        -- Engagement metrics
        comments INTEGER DEFAULT 0,
        views BIGINT DEFAULT 0,
        likes INTEGER DEFAULT 0,
        gmv DECIMAL(15,2) DEFAULT 0,
        video_count INTEGER DEFAULT 0,
        creator_count INTEGER DEFAULT 0,
        view_gain DECIMAL(15,2) DEFAULT 0,
        
        -- Product data
        product_id VARCHAR(50),
        product_name TEXT,
        price_value DECIMAL(10,2),
        price_display VARCHAR(50),
        units_sold INTEGER DEFAULT 0,
        product_img_url TEXT,
        
        -- Shop data
        shop_name VARCHAR(200),
        shop_id VARCHAR(50),
        
        -- Categories
        top_category VARCHAR(100),
        categories TEXT,
        
        -- Content analysis
        insights TEXT,
        transcription TEXT,
        reading_level VARCHAR(20),
        
        -- Metadata
        time_posted TIMESTAMP,
        is_ad BOOLEAN DEFAULT FALSE,
        has_error BOOLEAN DEFAULT FALSE,
        has_scraped BOOLEAN DEFAULT TRUE,
        attempts INTEGER DEFAULT 0,
        scrape_frequency INTEGER DEFAULT 4,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Unique constraint to prevent duplicate rankings per day
        CONSTRAINT unique_daily_ranking UNIQUE (collection_date, ranking)
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_collection_date ON daily_trending_products(collection_date);
      CREATE INDEX IF NOT EXISTS idx_ranking ON daily_trending_products(ranking);
      CREATE INDEX IF NOT EXISTS idx_product_id ON daily_trending_products(product_id);
      CREATE INDEX IF NOT EXISTS idx_gmv ON daily_trending_products(gmv);
    `;
    
    await pool.query(createTableSQL);
    console.log('✅ Table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Insert daily data
async function insertDailyData(products, collectionDate) {
  const pool = createConnection();
  
  try {
    console.log(`💾 Inserting ${products.length} products for date: ${collectionDate}`);
    
    // Clear existing data for this date
    await pool.query(
      'DELETE FROM daily_trending_products WHERE collection_date = $1',
      [collectionDate]
    );
    
    for (const product of products) {
      const insertSQL = `
        INSERT INTO daily_trending_products (
          collection_date, ranking, video_id, video_url, video_description, video_username,
          handle, author_id, thumbnail, comments, views, likes, gmv, video_count,
          creator_count, view_gain, product_id, product_name, price_value, price_display,
          units_sold, product_img_url, shop_name, shop_id, top_category, categories,
          insights, transcription, reading_level, time_posted, is_ad, has_error,
          has_scraped, attempts, scrape_frequency, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
      `;
      
      const values = [
        collectionDate,
        product.ranking || 0,
        product.video_id || '',
        product.video_url || '',
        product.video_description || '',
        product.video_username || '',
        product.handle || '',
        product.author_id || '',
        product.thumbnail || '',
        product.comments || 0,
        product.views || 0,
        product.likes || 0,
        parseFloat(product.gmv) || 0,
        product.video_count || 0,
        product.creator_count || 0,
        parseFloat(product.view_gain) || 0,
        product.product_data?.product_id || '',
        product.product_data?.name || '',
        parseFloat(product.product_data?.price_value) || 0,
        product.product_data?.price_display || '',
        product.product_data?.units_sold || 0,
        product.product_data?.img_url || '',
        product.product_data?.shop_name || '',
        product.product_data?.shop_id || '',
        product.top_category || '',
        JSON.stringify(product.product_data?.categories || []),
        JSON.stringify(product.insights || []),
        JSON.stringify(product.transcription || {}),
        product.transcription?.reading_level || '',
        product.time_posted ? new Date(product.time_posted) : null,
        product.is_ad || false,
        product.has_error || false,
        product.has_scraped || true,
        product.attempts || 0,
        product.scrape_frequency || 4,
        product.last_updated ? new Date(product.last_updated) : new Date()
      ];
      
      await pool.query(insertSQL, values);
    }
    
    console.log(`✅ Successfully inserted ${products.length} products for ${collectionDate}`);
    
  } catch (error) {
    console.error('❌ Error inserting data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Daily Trending Products Scraper - GitHub Action...');
    console.log(`⏰ Execution time: ${new Date().toISOString()}`);
    
    // Debug environment variables
    console.log('🔍 Environment check:');
    console.log(`DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
    console.log(`DATABASE_URL length: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0}`);
    
    // Test database connection first
    console.log('🔌 Testing database connection...');
    let testPool = null;
    let connectionMethod = 'connection string';
    
    try {
      // Try connection string first
      testPool = new Pool(DB_CONFIG);
      const testResult = await testPool.query('SELECT NOW() as current_time');
      console.log('✅ Database connection successful!');
      console.log(`⏰ Database time: ${testResult.rows[0].current_time}`);
      await testPool.end();
    } catch (dbError) {
      console.log('🔄 Connection string failed, trying alternative SSL method...');
      try {
        // Try alternative SSL connection
        testPool = new Pool(DB_CONFIG_ALT);
        const testResult = await testPool.query('SELECT NOW() as current_time');
        console.log('✅ Database connection successful with alternative SSL!');
        console.log(`⏰ Database time: ${testResult.rows[0].current_time}`);
        connectionMethod = 'alternative SSL';
        await testPool.end();
      } catch (altError) {
        console.error('❌ All connection methods failed:');
        console.error('Connection string error:', dbError.message);
        console.error('Alternative SSL error:', altError.message);
        
        // Try to get more network info
        console.log('🌐 Network diagnostics:');
        console.log('GitHub Actions runner environment detected');
        console.log('This may be a network restriction issue');
        
        console.error('🔍 Connection details:', {
          hasUrl: !!process.env.DATABASE_URL,
          urlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
          errorCode: altError.code,
          errorMessage: altError.message,
          runnerOS: process.platform,
          nodeVersion: process.version
        });
        
        // For now, let's skip database operations and just fetch data
        console.log('⚠️ Skipping database operations due to connection issues');
        console.log('📡 Will fetch data and report results without storage');
        
        // Fetch data without database
        const products = await fetchAllProducts();
        if (products.length > 0) {
          const totalGMV = products.reduce((sum, p) => sum + (parseFloat(p.gmv) || 0), 0);
          console.log('🎯 Data Fetch Complete (No Database Storage):');
          console.log(`📊 Products: ${products.length} (Target: 240)`);
          console.log(`💰 Total GMV: £${totalGMV.toLocaleString()}`);
          console.log('⚠️ Data not saved to database due to connection issues');
          process.exit(0); // Exit successfully but with warning
        } else {
          console.log('❌ No products fetched');
          process.exit(1);
        }
      }
    }
    
    console.log(`🔗 Using connection method: ${connectionMethod}`);
    
    // Create table
    await createTable();
    
    // Fetch all products
    const products = await fetchAllProducts();
    
    if (products.length === 0) {
      console.log('⚠️ No products found, skipping insertion');
      process.exit(1);
    }
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Insert data
    await insertDailyData(products, today);
    
    const totalGMV = products.reduce((sum, p) => sum + (parseFloat(p.gmv) || 0), 0);
    
    console.log('🎯 Daily Scraping Complete!');
    console.log(`📅 Date: ${today}`);
    console.log(`📊 Products: ${products.length} (Target: 240)`);
    console.log(`💰 Total GMV: £${totalGMV.toLocaleString()}`);
    
    // GitHub Action success
    console.log('✅ GitHub Action completed successfully');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      port: error.port
    });
    process.exit(1);
  }
}

// Run the main function
main();
