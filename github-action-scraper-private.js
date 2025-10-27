// GitHub Action script for daily TikTok trending products scraper using Supabase client
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://edgitshcqelilcjkndho.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZ2l0c2hjcWVsaWxjamtuZGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTExMzksImV4cCI6MjA3Njk4NzEzOX0.rgethMENBCp6F57GAyQknSZjmKdxpQaoJcr6BYOUIq8';

const supabase = createClient(supabaseUrl, supabaseKey);

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
    console.log(`SUPABASE_KEY exists: ${!!process.env.SUPABASE_KEY}`);
    console.log(`SUPABASE_KEY length: ${process.env.SUPABASE_KEY ? process.env.SUPABASE_KEY.length : 0}`);
    
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