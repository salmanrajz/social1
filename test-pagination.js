// Test pagination to fetch 100 products
const http = require('http');

async function fetchPage(offset, limit) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/videos?region=uk&days=1&limit=${limit}&offset=${offset}`,
      method: 'GET',
      headers: {
        'accept': '*/*',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          const products = jsonData.results || [];
          console.log(`📄 Page ${Math.floor(offset/limit) + 1}: Got ${products.length} products`);
          resolve(products);
        } catch (error) {
          console.error(`❌ Error parsing page:`, error.message);
          resolve([]);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error fetching page:`, error.message);
      resolve([]);
    });
    
    req.setTimeout(10000, () => {
      console.error(`⏰ Timeout fetching page`);
      req.destroy();
      resolve([]);
    });
    
    req.end();
  });
}

async function testPagination() {
  console.log('🧪 Testing pagination to fetch 100 products...');
  
  const allProducts = [];
  const limit = 20;
  let offset = 0;
  
  try {
    for (let page = 1; page <= 5; page++) { // 5 pages = 100 products
      console.log(`\n📄 Fetching page ${page} (offset: ${offset})...`);
      
      const products = await fetchPage(offset, limit);
      
      if (products.length === 0) {
        console.log('⚠️ No more products found, stopping pagination');
        break;
      }
      
      allProducts.push(...products);
      offset += limit;
      
      console.log(`✅ Page ${page} complete: ${products.length} products`);
      console.log(`📊 Total so far: ${allProducts.length} products`);
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n🎯 Pagination Test Complete!`);
    console.log(`📊 Total products fetched: ${allProducts.length}`);
    console.log(`💰 Total GMV: £${allProducts.reduce((sum, p) => sum + (parseFloat(p.gmv) || 0), 0).toLocaleString()}`);
    
    // Show top 5 products
    console.log(`\n🏆 Top 5 Products:`);
    allProducts.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. ${product.product_data?.name || 'Unknown Product'}`);
      console.log(`   💰 GMV: £${(parseFloat(product.gmv) || 0).toLocaleString()}`);
      console.log(`   👀 Views: ${(product.views || 0).toLocaleString()}`);
      console.log(`   🏪 Shop: ${product.product_data?.shop_name || 'Unknown'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('💥 Error during pagination test:', error);
  }
}

testPagination();




