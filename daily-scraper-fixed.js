// Daily scraper with correct pagination logic to fetch 100 products
const https = require('https');
const mysql = require('mysql2/promise');

// Database configuration
const DB_CONFIG = {
  host: 'chatvocusdb.mysql.database.azure.com',
  port: 3306,
  user: 'salmanrajz',
  password: '@Xuj0324!!!',
  database: 'duquickpay',
  ssl: { rejectUnauthorized: false }
};

// Create MySQL connection
function createConnection() {
  return mysql.createConnection(DB_CONFIG);
}

// Fetch single page from direct API with correct parameters
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

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          const products = jsonData.results || [];
          
          // Fix ranking to be sequential (1-100)
          products.forEach((product, index) => {
            product.ranking = offset + index + 1;
          });
          
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

// Fetch all products with correct pagination
async function fetchAllProducts() {
  const allProducts = [];
  const limit = 20; // 20 products per request
  let offset = 0;
  let page = 1;
  
  console.log('📡 Fetching 100 products with correct pagination...');
  
  while (allProducts.length < 100 && page <= 10) { // Max 10 pages
    console.log(`📄 Page ${page} (offset: ${offset}, limit: ${limit})...`);
    
    const products = await fetchPage(offset, limit);
    
    if (products.length === 0) {
      console.log('⚠️ No more products available');
      break;
    }
    
    allProducts.push(...products);
    console.log(`   ✅ Got ${products.length} products (total: ${allProducts.length})`);
    
    // Show ranking range for this page
    if (products.length > 0) {
      const firstRank = products[0].ranking;
      const lastRank = products[products.length - 1].ranking;
      console.log(`   📊 Rankings: ${firstRank} - ${lastRank}`);
    }
    
    offset += limit;
    page++;
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`🎯 Fetched ${allProducts.length} products total`);
  console.log(`📊 Ranking range: 1 - ${allProducts.length}`);
  return allProducts.slice(0, 100); // Ensure max 100
}

// Create table
async function createTable() {
  const connection = await createConnection();
  
  try {
    console.log('🗄️ Creating daily_trending_products table...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS daily_trending_products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        collection_date DATE NOT NULL,
        ranking INT NOT NULL,
        
        -- Video metrics
        video_id VARCHAR(50) NOT NULL,
        video_url TEXT,
        video_description TEXT,
        video_username VARCHAR(100),
        handle VARCHAR(100),
        author_id VARCHAR(50),
        thumbnail TEXT,
        
        -- Engagement metrics
        comments INT DEFAULT 0,
        views BIGINT DEFAULT 0,
        likes INT DEFAULT 0,
        gmv DECIMAL(15,2) DEFAULT 0,
        video_count INT DEFAULT 0,
        creator_count INT DEFAULT 0,
        view_gain DECIMAL(15,2) DEFAULT 0,
        
        -- Product data
        product_id VARCHAR(50),
        product_name TEXT,
        price_value DECIMAL(10,2),
        price_display VARCHAR(50),
        units_sold INT DEFAULT 0,
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
        time_posted DATETIME,
        is_ad BOOLEAN DEFAULT FALSE,
        has_error BOOLEAN DEFAULT FALSE,
        has_scraped BOOLEAN DEFAULT TRUE,
        attempts INT DEFAULT 0,
        scrape_frequency INT DEFAULT 4,
        last_updated DATETIME,
        
        -- Indexes
        INDEX idx_collection_date (collection_date),
        INDEX idx_ranking (ranking),
        INDEX idx_product_id (product_id),
        INDEX idx_gmv (gmv)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createTableSQL);
    console.log('✅ Table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Insert daily data
async function insertDailyData(products, collectionDate) {
  const connection = await createConnection();
  
  try {
    console.log(`💾 Inserting ${products.length} products for date: ${collectionDate}`);
    
    // Clear existing data for this date
    await connection.execute(
      'DELETE FROM daily_trending_products WHERE collection_date = ?',
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      
      await connection.execute(insertSQL, values);
    }
    
    console.log(`✅ Successfully inserted ${products.length} products for ${collectionDate}`);
    
  } catch (error) {
    console.error('❌ Error inserting data:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Daily Trending Products Scraper (100 Products) - Fixed Pagination...');
    console.log(`⏰ Execution time: ${new Date().toISOString()}`);
    
    // Create table
    await createTable();
    
    // Fetch all products with correct pagination
    const products = await fetchAllProducts();
    
    if (products.length === 0) {
      console.log('⚠️ No products found, skipping insertion');
      return;
    }
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Insert data
    await insertDailyData(products, today);
    
    console.log('\n🎯 Daily Scraping Complete!');
    console.log(`📅 Date: ${today}`);
    console.log(`📊 Products: ${products.length}`);
    console.log(`💰 Total GMV: £${products.reduce((sum, p) => sum + (parseFloat(p.gmv) || 0), 0).toLocaleString()}`);
    
    // Show top 10 products with correct rankings
    console.log('\n🏆 Top 10 Trending Products Today:');
    console.log('='.repeat(100));
    products.slice(0, 10).forEach((product, index) => {
      console.log(`Rank ${product.ranking.toString().padStart(3)}: ${(product.product_data?.name || 'Unknown Product').substring(0, 60)}...`);
      console.log(`    💰 GMV: £${(parseFloat(product.gmv) || 0).toLocaleString().padStart(12)} | 👀 Views: ${(product.views || 0).toLocaleString().padStart(10)} | 🛒 Units: ${(product.product_data?.units_sold || 0).toLocaleString().padStart(8)}`);
      console.log(`    🏪 Shop: ${product.product_data?.shop_name || 'Unknown'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, createTable, insertDailyData, fetchAllProducts };




