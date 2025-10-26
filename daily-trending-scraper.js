const mysql = require('mysql2/promise');
const fetch = require('node-fetch');

// Database configuration
const dbConfig = {
  host: 'chatvocusdb.mysql.database.azure.com',
  port: 3306,
  user: 'duquickpay',
  password: '@Xuj0324!!!',
  database: 'neweticrm',
  ssl: {
    rejectUnauthorized: false
  }
};

// TikTok API configuration
const API_BASE_URL = 'https://www.social1.ai/api/videos/getTopVideos';
const API_HEADERS = {
  'accept': '*/*',
  'accept-language': 'en-US,en;q=0.9',
  'cookie': '_ga=GA1.1.1881742864.1759043181; _ga_KW1C8BH7Q1=GS2.1.s1759063488$o3$g1$t1759063555$j57$l0$h0; __Host-next-auth.csrf-token=a94e8ab6ff9168567f058830865b30d19c4fc6486b91f324e97b3b3d7329029d%7C1021bc754a0c458bd4123d7e1a2c0f4e36609566ad7aa1a861322c660277e78e; __Secure-next-auth.callback-url=https%3A%2F%2Fwww.social1.ai%2Fsignin%3Fsession_id%3Dcs_live_b1ayzYZtJzTLv5gDvdBJQbM45ufEErT8cSNgSlnXTR6UzppDvqPiRJenG9; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Q0qhPRF2wDMi_TJf.Lr84cuzJ0c-zzyKnYcfDXWw179eItAMdddK_1h_skfEiVbyMPQlPBooQQN_HNWZvbkzhtEZUzQPNanMuS7KSS1maNIIMnWZ2ZRSq8p510mz645_aEA-BzIdSN9tWrlRrIeLVney0vfFuqXgRzQaIvC27tMVzvclq0G-7Oyb8ek44Mu_tg0Qlr8fZttKDNyLYfmnjKg6CaS3KfaOlExQ6DL0aGSgbFgza-O8Znrl_2g-VdhkSWyMhq0mVcG0wHyjQjWuzITTYEZhdelFAiL24_zm6EXC1cYHI3p1OQ8ub-Z4pRZDTpHTPtWN84fiuNxrZiGY4t7uZlVb8ddWan6hbgkZ6NDZRXe8pkiZNhdyuJ6W9guhFfd3bloANCc7_OA.rLb33E0DUG0SJfkrWiHbxA; ph_phc_LvsHwkuAh5ZkWAADNlrGGfG14aaUsBNwOckji9YooKX_posthog=%7B%22distinct_id%22%3A%2268e513b98343115e47e60b8e%22%2C%22%24sesid%22%3A%5B1759865431714%2C%220199c021-aafb-7d27-b50a-1a4b20417b26%22%2C1759865055995%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fwww.social1.ai%2F%22%7D%7D',
  'priority': 'u=1, i',
  'referer': 'https://www.social1.ai/',
  'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
};

async function createTable() {
  const connection = await mysql.createConnection(dbConfig);
  
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
        
        -- Categories and classification
        top_category VARCHAR(100),
        categories JSON,
        
        -- Content analysis
        insights JSON,
        transcription JSON,
        reading_level VARCHAR(20),
        
        -- Metadata
        time_posted DATETIME,
        is_ad BOOLEAN DEFAULT FALSE,
        has_error BOOLEAN DEFAULT FALSE,
        has_scraped BOOLEAN DEFAULT TRUE,
        attempts INT DEFAULT 0,
        scrape_frequency INT DEFAULT 4,
        last_updated DATETIME,
        
        -- Indexes for performance
        INDEX idx_collection_date (collection_date),
        INDEX idx_ranking (ranking),
        INDEX idx_product_id (product_id),
        INDEX idx_gmv (gmv),
        INDEX idx_date_ranking (collection_date, ranking)
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

async function fetchTrendingData(region = 'uk', days = 1, limit = 100) {
  try {
    console.log(`📡 Fetching trending data for region: ${region}, days: ${days}, limit: ${limit}`);
    
    const apiUrl = new URL(API_BASE_URL);
    apiUrl.searchParams.set('region', region);
    apiUrl.searchParams.set('days', days);
    apiUrl.searchParams.set('limit', limit);
    apiUrl.searchParams.set('offset', '0');
    
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: API_HEADERS
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Fetched ${data.results?.length || 0} trending products`);
    
    return data.results || [];
    
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    throw error;
  }
}

async function insertDailyData(products, collectionDate) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log(`💾 Inserting ${products.length} products for date: ${collectionDate}`);
    
    // Clear existing data for this date (in case of re-run)
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

async function getDailyComparison(date1, date2) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log(`📊 Comparing trends between ${date1} and ${date2}`);
    
    const comparisonSQL = `
      SELECT 
        d1.ranking as date1_rank,
        d1.product_name,
        d1.gmv as date1_gmv,
        d1.views as date1_views,
        d2.ranking as date2_rank,
        d2.gmv as date2_gmv,
        d2.views as date2_views,
        (d1.ranking - d2.ranking) as rank_change,
        (d2.gmv - d1.gmv) as gmv_change
      FROM daily_trending_products d1
      LEFT JOIN daily_trending_products d2 ON d1.product_id = d2.product_id AND d2.collection_date = ?
      WHERE d1.collection_date = ?
      ORDER BY d1.ranking
      LIMIT 20
    `;
    
    const [rows] = await connection.execute(comparisonSQL, [date2, date1]);
    
    console.log('\n📈 Top 20 Products Comparison:');
    console.log('='.repeat(100));
    console.log('Rank | Product Name | GMV Change | Views Change | Rank Change');
    console.log('-'.repeat(100));
    
    rows.forEach(row => {
      const rankChange = row.rank_change ? (row.rank_change > 0 ? `+${row.rank_change}` : row.rank_change) : 'N/A';
      const gmvChange = row.gmv_change ? (row.gmv_change > 0 ? `+£${row.gmv_change.toFixed(2)}` : `£${row.gmv_change.toFixed(2)}`) : 'N/A';
      
      console.log(`${row.date1_rank.toString().padStart(4)} | ${row.product_name.substring(0, 40).padEnd(40)} | ${gmvChange.padStart(10)} | ${row.date1_views.toString().padStart(12)} | ${rankChange.padStart(10)}`);
    });
    
    return rows;
    
  } catch (error) {
    console.error('❌ Error getting comparison:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function main() {
  try {
    console.log('🚀 Starting Daily Trending Products Scraper...');
    console.log(`⏰ Execution time: ${new Date().toISOString()}`);
    
    // Create table if not exists
    await createTable();
    
    // Fetch trending data
    const products = await fetchTrendingData('uk', 1, 100);
    
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
    
    // Show top 5 products
    console.log('\n🏆 Top 5 Trending Products Today:');
    console.log('='.repeat(80));
    products.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. ${product.product_data?.name || 'Unknown Product'}`);
      console.log(`   💰 GMV: £${(parseFloat(product.gmv) || 0).toLocaleString()}`);
      console.log(`   👀 Views: ${(product.views || 0).toLocaleString()}`);
      console.log(`   🛒 Units Sold: ${product.product_data?.units_sold || 0}`);
      console.log(`   🏪 Shop: ${product.product_data?.shop_name || 'Unknown'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Export functions for external use
module.exports = {
  createTable,
  fetchTrendingData,
  insertDailyData,
  getDailyComparison,
  main
};

// Run if called directly
if (require.main === module) {
  main();
}




