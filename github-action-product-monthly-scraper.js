// GitHub Action script for monthly trending products scraper
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://edgitshcqelilcjkndho.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZ2l0c2hjcWVsaWxjamtuZGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTExMzksImV4cCI6MjA3Njk4NzEzOX0.rgethMENBCp6F57GAyQknSZjmKdxpQaoJcr6BYOUIq8';

const supabase = createClient(supabaseUrl, supabaseKey);

// Cookie from the curl command
const COOKIE = '__Host-next-auth.csrf-token=f51822931a3938e7183214610b3fced33a88ca6f264cf9166d2a1986f8f410f0%7C92eb36b3d0b8973afc2041cb3bc5ffd4a9361f8a66e3a48bac8c0f765c180f8a; __Secure-next-auth.callback-url=https%3A%2F%2Fwww.social1.ai%2Fsignin%3Fsession_id%3Dcs_live_b1s6Kp1ojl2hgxNMMrcljVhZKLoXyVmmjR7GclJTXB7aJqtyZ43yDB6n1x; ph_phc_LvsHwkuAh5ZkWAADNlrGGfG14aaUsBNwOckji9YooKX_posthog=%7B%22distinct_id%22%3A%2269297fa73c7d3579dd7a46e0%22%2C%22%24sesid%22%3A%5B1764334958782%2C%22019aca8b-aef8-7efe-b990-428189a40ea9%22%2C1764334743285%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fwww.social1.ai%2F%22%7D%7D; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..HFSkWubyXMAZcR8j.3956X-XKaoKvDiSeYGAcVJ83cFL3o2Cen7wkAULq6Rz6NMMBBHVBflyoWO03VlFco92fhWVrQD7t9ZelL7JsuLXOs5F1RKc0wxE_InKE149JUi7FkcWQJ38AN6o43WsfTTAFwKUrsZ_tEgFJ1_tq-KiAZQRYLcqQ6G7zwM1UXT68UUdImrqws4gkDv_IN8XQvKqZne0I7TCPE8xn8giWM3Pgeo9ScmzRTKVNKmas-v48Z70A06RxAbSDgCw6UVJULulJ4HToDVtMnIN4Bp08Xh4fvGfOEUloI1T9qy1RiEB1vhyzu41bK8l6nPlKWlD6TM8D-swUIu3MB53fS7BMCfzVsHviQLUejhN2gG9yzgbdHn6b.Hwkk1ryzzp5PIgNa_jmxkg';

// Fetch single page from products API
async function fetchPage(offset, limit, days = 30, region = 'us') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.social1.ai',
      port: 443,
      path: `/api/products/getTopProducts?limit=${limit}&offset=${offset}&days=${days}&region=${region}`,
      method: 'GET',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': COOKIE,
        'priority': 'u=1, i',
        'referer': 'https://www.social1.ai/products',
        'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
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
          
          // Handle API response structure: { results: [...] } or { data: { results: [...] } }
          let products = [];
          if (jsonData.results && Array.isArray(jsonData.results)) {
            products = jsonData.results;
          } else if (jsonData.data && Array.isArray(jsonData.data)) {
            products = jsonData.data;
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
      // Retry logic: if it's a network error, wait and retry once
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.message.includes('hang up')) {
        console.log(`🔄 Retrying page ${Math.floor(offset/limit) + 1} after network error...`);
        setTimeout(() => {
          fetchPage(offset, limit, days, region).then(resolve).catch(() => resolve([]));
        }, 3000);
        return;
      }
      resolve([]);
    });
    
    req.setTimeout(30000, () => {
      console.error(`⏰ Timeout page ${Math.floor(offset/limit) + 1} (30s timeout)`);
      req.destroy();
      resolve([]);
    });
    
    req.end();
  });
}

// Fetch all products with pagination
async function fetchAllProducts(days = 30, region = 'us') {
  const allProducts = [];
  const limit = 12;
  let offset = 0;
  let page = 1;
  const targetProducts = 240;
  
  console.log(`📡 Fetching products (days=${days}, region=${region}) using API's original ranking...`);
  
  while (allProducts.length < targetProducts && page <= 50) {
    console.log(`📄 Page ${page} (offset: ${offset}, limit: ${limit})...`);
    
    const products = await fetchPage(offset, limit, days, region);
    
    if (products.length === 0) {
      console.log('⚠️ No more products available');
      break;
    }
    
    allProducts.push(...products);
    console.log(`✅ Got ${products.length} products (total: ${allProducts.length})`);
    
    offset += limit;
    page++;
    
    // Small delay between requests (increased to avoid rate limiting)
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`🎯 Fetched ${allProducts.length} products total`);
  return allProducts.slice(0, targetProducts);
}

// Test Supabase connection
async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('monthly_trending_products_api')
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

// Insert monthly data using Supabase client
async function insertMonthlyData(products, collectionDate) {
  try {
    console.log(`💾 Inserting ${products.length} products for month: ${collectionDate}`);
    
    // Clear existing data for this month
    const { error: deleteError } = await supabase
      .from('monthly_trending_products_api')
      .delete()
      .eq('collection_date', collectionDate);
    
    if (deleteError) {
      console.log('⚠️ Could not clear existing data:', deleteError.message);
    } else {
      console.log('✅ Cleared existing data for this month');
    }
    
    // Prepare data for insertion
    const insertData = products.map((product, index) => ({
      collection_date: collectionDate,
      ranking: index + 1, // Products are already ranked
      product_id: product.product_id || product.id || '',
      product_name: product.name || product.product_name || '',
      price_value: parseFloat(product.price_value || product.price || 0),
      price_display: product.price_display || product.price || '',
      units_sold: product.units_sold || 0,
      product_img_url: product.product_img_url || product.img_url || product.image || '',
      shop_name: product.shop?.shop_name || product.shop_name || '',
      shop_id: product.shop?.shop_id || product.shop_id || '',
      categories: JSON.stringify(product.categories || []),
      gmv: parseFloat(product.gmv || 0),
      video_count: product.video_count || 0,
      creator_count: product.creator_count || 0,
      region: product.region || 'us',
      last_updated: new Date()
    }));
    
    // Insert data in batches
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < insertData.length; i += batchSize) {
      const batch = insertData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('monthly_trending_products_api')
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
    console.log('🚀 Starting Monthly Trending Products Scraper - GitHub Action...');
    console.log(`⏰ Execution time: ${new Date().toISOString()}`);
    
    // Debug environment variables
    console.log('🔍 Environment check:');
    console.log(`SUPABASE_KEY exists: ${!!process.env.SUPABASE_KEY}`);
    console.log(`SUPABASE_KEY length: ${process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.length : 0}`);
    
    // Test Supabase connection
    await testConnection();
    
    // Fetch all products (days=30 for monthly)
    const products = await fetchAllProducts(30, 'us');
    
    if (products.length === 0) {
      console.log('⚠️ No products found, skipping insertion');
      process.exit(1);
    }
    
    // Get current month (YYYY-MM format)
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Insert data
    await insertMonthlyData(products, month);
    
    const totalGMV = products.reduce((sum, p) => sum + (parseFloat(p.gmv || 0)), 0);
    const totalUnitsSold = products.reduce((sum, p) => sum + (parseInt(p.units_sold || 0)), 0);
    
    console.log('🎯 Monthly Product Scraping Complete!');
    console.log(`📅 Month: ${month}`);
    console.log(`📊 Products: ${products.length} (Target: 240)`);
    console.log(`💰 Total GMV: $${totalGMV.toLocaleString()}`);
    console.log(`📦 Total Units Sold: ${totalUnitsSold.toLocaleString()}`);
    
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

