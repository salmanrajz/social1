// Test Supabase PostgreSQL connection and create table
const { Pool } = require('pg');

// Database configuration for Supabase PostgreSQL
const DB_CONFIG = {
  connectionString: 'postgresql://postgres:ItNbms57VeQIFeJH@db.edgitshcqelilcjkndho.supabase.co:5432/postgres?sslmode=disable',
  ssl: false
};

async function testConnection() {
  const pool = new Pool(DB_CONFIG);
  
  try {
    console.log('🔌 Testing Supabase PostgreSQL connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('✅ Connection successful!');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL version:', result.rows[0].postgres_version.split(' ')[0]);
    
    // Create the daily_trending_products table
    console.log('\n🗄️ Creating daily_trending_products table...');
    
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
    `;
    
    await pool.query(createTableSQL);
    console.log('✅ Table created successfully!');
    
    // Create indexes
    console.log('📊 Creating indexes...');
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_collection_date ON daily_trending_products(collection_date);',
      'CREATE INDEX IF NOT EXISTS idx_ranking ON daily_trending_products(ranking);',
      'CREATE INDEX IF NOT EXISTS idx_product_id ON daily_trending_products(product_id);',
      'CREATE INDEX IF NOT EXISTS idx_gmv ON daily_trending_products(gmv);'
    ];
    
    for (const query of indexQueries) {
      await pool.query(query);
    }
    console.log('✅ Indexes created successfully!');
    
    // Test insert a sample record
    console.log('\n🧪 Testing sample data insertion...');
    const testInsertSQL = `
      INSERT INTO daily_trending_products (
        collection_date, ranking, video_id, video_url, video_description, 
        video_username, handle, author_id, thumbnail, comments, views, 
        likes, gmv, video_count, creator_count, view_gain, product_id, 
        product_name, price_value, price_display, units_sold, product_img_url, 
        shop_name, shop_id, top_category, categories, insights, transcription, 
        reading_level, time_posted, is_ad, has_error, has_scraped, attempts, 
        scrape_frequency, last_updated
      ) VALUES (
        CURRENT_DATE, 1, 'test_video_123', 'https://tiktok.com/test', 'Test video description',
        'testuser', 'testuser', 'test_author_123', 'https://example.com/thumb.jpg', 100, 1000,
        50, 500.00, 10, 5, 200.00, 'test_product_123', 'Test Product', 25.99, '£25.99', 20,
        'https://example.com/product.jpg', 'Test Shop', 'test_shop_123', 'Test Category',
        '["category1", "category2"]', '[]', '{}', '3rd grade', CURRENT_TIMESTAMP, false,
        false, true, 0, 4, CURRENT_TIMESTAMP
      ) ON CONFLICT (collection_date, ranking) DO NOTHING;
    `;
    
    await pool.query(testInsertSQL);
    console.log('✅ Sample data inserted successfully!');
    
    // Verify the data
    const verifyResult = await pool.query(
      'SELECT COUNT(*) as count FROM daily_trending_products WHERE collection_date = CURRENT_DATE'
    );
    console.log(`📊 Records in table today: ${verifyResult.rows[0].count}`);
    
    console.log('\n🎉 Supabase setup complete! Ready for daily scraping.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection();
