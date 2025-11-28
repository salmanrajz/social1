// GitHub Action script for daily TikTok trending products scraper (Public Version)
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://edgitshcqelilcjkndho.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const productsPerRegion = (() => {
  const raw = process.env.PRODUCTS_PER_REGION || process.env.TIKTOK_PRODUCTS_PER_REGION;
  if (!raw) {
    return 240;
  }

  const parsed = parseInt(raw, 10);
  if (!Number.isNaN(parsed) && parsed >= 12) {
    return parsed;
  }

  console.warn(`⚠️ Invalid PRODUCTS_PER_REGION value "${raw}". Falling back to 240 per region.`);
  return 240;
})();

// Fetch single page from TikTok API via proxy service
async function fetchPage(offset, limit) {
  return new Promise((resolve) => {
    const proxyHostname = process.env.PROXY_HOSTNAME || process.env.API_HOSTNAME || 'your-proxy-api.com';
    const apiKey = process.env.PROXY_API_KEY || process.env.API_KEY;
    
    const options = {
      hostname: proxyHostname,
      port: 443,
      path: `/api/tiktok-products?region=uk&days=1&limit=${limit}&offset=${offset}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          // Check HTTP status code
          if (res.statusCode !== 200) {
            console.error(`❌ HTTP ${res.statusCode} error page ${Math.floor(offset/limit) + 1}: ${data.substring(0, 200)}`);
            resolve([]);
            return;
          }
          
          const jsonData = JSON.parse(data);
          
          // Handle proxy API response structure: { success: true, data: { results: [...] } }
          // or direct API response: { results: [...] }
          let products = [];
          if (jsonData.success && jsonData.data) {
            products = jsonData.data.results || jsonData.data || [];
          } else if (jsonData.results) {
            products = jsonData.results;
          } else if (Array.isArray(jsonData)) {
            products = jsonData;
          }
          
          resolve(products);
        } catch (error) {
          console.error(`❌ Parse error page ${Math.floor(offset/limit) + 1}:`, error.message);
          console.error(`Response data: ${data.substring(0, 500)}`);
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
  const targetProducts = 240;
  
  console.log('📡 Fetching products using API\'s original ranking...');
  
  while (allProducts.length < targetProducts && page <= 25) {
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

// Test Supabase connection
async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('daily_trending_products')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      throw error;
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('📊 Current records:', data);
      return true;
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    throw error;
  }
}

// Insert daily data using Supabase client
async function insertDailyData(products, collectionDate) {
  try {
    console.log(`💾 Inserting ${products.length} products for date: ${collectionDate}`);
    
    // Clear existing data for this date
    const { error: deleteError } = await supabase
      .from('daily_trending_products')
      .delete()
      .eq('collection_date', collectionDate);
    
    if (deleteError) {
      console.log('⚠️ Could not clear existing data:', deleteError.message);
    } else {
      console.log('✅ Cleared existing data for today');
    }
    
    // Prepare data for insertion
    const insertData = products.map(product => ({
      collection_date: collectionDate,
      ranking: product.ranking || 0,
      video_id: product.video_id || '',
      video_url: product.video_url || '',
      video_description: product.video_description || '',
      video_username: product.video_username || '',
      handle: product.handle || '',
      author_id: product.author_id || '',
      thumbnail: product.thumbnail || '',
      comments: product.comments || 0,
      views: product.views || 0,
      likes: product.likes || 0,
      gmv: parseFloat(product.gmv) || 0,
      video_count: product.video_count || 0,
      creator_count: product.creator_count || 0,
      view_gain: parseFloat(product.view_gain) || 0,
      product_id: product.product_data?.product_id || '',
      product_name: product.product_data?.name || '',
      price_value: parseFloat(product.product_data?.price_value) || 0,
      price_display: product.product_data?.price_display || '',
      units_sold: product.product_data?.units_sold || 0,
      product_img_url: product.product_data?.img_url || '',
      shop_name: product.product_data?.shop_name || '',
      shop_id: product.product_data?.shop_id || '',
      top_category: product.top_category || '',
      categories: JSON.stringify(product.product_data?.categories || []),
      insights: JSON.stringify(product.insights || []),
      transcription: JSON.stringify(product.transcription || {}),
      reading_level: product.transcription?.reading_level || '',
      time_posted: product.time_posted ? new Date(product.time_posted) : null,
      is_ad: product.is_ad || false,
      has_error: product.has_error || false,
      has_scraped: product.has_scraped || true,
      attempts: product.attempts || 0,
      scrape_frequency: product.scrape_frequency || 4,
      last_updated: product.last_updated ? new Date(product.last_updated) : new Date()
    }));
    
    // Insert data in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < insertData.length; i += batchSize) {
      const batch = insertData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('daily_trending_products')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        throw error;
      }
      
      inserted += batch.length;
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} products (total: ${inserted})`);
    }
    
    console.log(`✅ Successfully inserted ${inserted} products for ${collectionDate}`);
    
  } catch (error) {
    console.error('❌ Error inserting data:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Daily Trending Products Scraper - GitHub Action...');
    console.log(`⏰ Execution time: ${new Date().toISOString()}`);
    
    // Debug environment variables
    console.log('🔍 Environment check:');
    console.log(`SUPABASE_URL exists: ${!!process.env.SUPABASE_URL}`);
    console.log(`SUPABASE_KEY exists: ${!!process.env.SUPABASE_KEY}`);
    console.log(`API_KEY exists: ${!!process.env.API_KEY}`);
    console.log(`PROXY_API_KEY exists: ${!!process.env.PROXY_API_KEY}`);
    console.log(`PROXY_HOSTNAME exists: ${!!process.env.PROXY_HOSTNAME}`);
    
    // Test Supabase connection
    await testConnection();
    
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