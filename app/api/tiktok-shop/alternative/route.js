import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Alternative approach: Use TikTok's mobile API or different endpoints
    const alternativeUrls = [
      `https://www.tiktok.com/api/shop/product/detail/?product_id=${productId}`,
      `https://www.tiktok.com/shop/api/product/detail?product_id=${productId}`,
      `https://m.tiktok.com/shop/product/${productId}`,
    ];

    for (const url of alternativeUrls) {
      try {
        console.log(`🔍 Trying alternative URL: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.tiktok.com/',
            'Origin': 'https://www.tiktok.com',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
          }
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('✅ Success with alternative URL:', url);
            
            return NextResponse.json({
              success: true,
              productId,
              source: url,
              data: parseAlternativeData(data),
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.log(`❌ Failed with ${url}:`, error.message);
        continue;
      }
    }

    // If all alternatives fail, return a helpful message
    return NextResponse.json({
      success: false,
      productId,
      message: 'TikTok Shop data is currently protected by anti-bot measures',
      suggestion: 'Try visiting the product page manually or use the Social1 API data',
      shopUrl: `https://www.tiktok.com/shop/gb/pdp/${productId}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Alternative TikTok Shop scraping error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scrape TikTok Shop with alternative methods', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function parseAlternativeData(data) {
  try {
    // Try to extract product information from various possible data structures
    const product = data.data || data.product || data;
    
    return {
      unitsSold: product.units_sold || product.sold_count || product.quantity_sold || null,
      price: product.price || product.price_value || product.current_price || null,
      shopName: product.shop_name || product.shop?.name || product.store_name || null,
      productName: product.name || product.title || product.product_name || null,
      availability: product.availability || product.in_stock ? 'In Stock' : 'Out of Stock',
      rawData: data // Include raw data for debugging
    };
  } catch (error) {
    console.error('Error parsing alternative data:', error);
    return {
      unitsSold: null,
      price: null,
      shopName: null,
      productName: null,
      availability: null,
      error: 'Failed to parse product data'
    };
  }
}
