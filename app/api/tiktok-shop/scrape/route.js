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

    // Construct TikTok Shop URL
    const tiktokShopUrl = `https://www.tiktok.com/shop/gb/pdp/${productId}`;
    
    console.log(`🔍 Scraping TikTok Shop: ${tiktokShopUrl}`);

    // Fetch the TikTok Shop page with enhanced headers
    const response = await fetch(tiktokShopUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`TikTok Shop request failed: ${response.status} - ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`📄 HTML length: ${html.length} characters`);

    // Parse the HTML to extract product data
    const productData = extractProductData(html, productId);
    
    return NextResponse.json({
      success: true,
      productId,
      shopUrl: tiktokShopUrl,
      data: productData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('TikTok Shop scraping error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scrape TikTok Shop', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function extractProductData(html, productId) {
  try {
    // Check if we got a security check page
    if (html.includes('Security Check') || html.includes('captcha') || html.includes('robot')) {
      console.log('🚫 TikTok security check detected');
      return {
        unitsSold: 'Security Blocked',
        price: null,
        shopName: null,
        productName: 'Security Check Required',
        availability: 'Blocked',
        error: 'TikTok security check - manual verification required'
      };
    }

    // Try to find JSON-LD structured data
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s);
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        console.log('📊 Found JSON-LD data:', jsonLd);
        
        if (jsonLd.offers) {
          return {
            unitsSold: jsonLd.offers.availability === 'InStock' ? 'Available' : 'Out of Stock',
            price: jsonLd.offers.price,
            shopName: jsonLd.brand?.name || 'Unknown Shop',
            productName: jsonLd.name,
            availability: jsonLd.offers.availability
          };
        }
      } catch (e) {
        console.log('❌ Failed to parse JSON-LD:', e.message);
      }
    }

    // Try to find window.__INITIAL_STATE__ or similar
    const initialStateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/s);
    if (initialStateMatch) {
      try {
        const initialState = JSON.parse(initialStateMatch[1]);
        console.log('🔄 Found initial state data');
        
        // Look for product data in the state
        const productData = findProductInState(initialState, productId);
        if (productData) {
          return productData;
        }
      } catch (e) {
        console.log('❌ Failed to parse initial state:', e.message);
      }
    }

    // Try to find product data in script tags
    const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gs);
    if (scriptMatches) {
      for (const script of scriptMatches) {
        try {
          // Look for product-related data
          if (script.includes('unitsSold') || script.includes('sold') || script.includes('quantity')) {
            console.log('🔍 Found potential product data in script');
            
            // Try to extract numbers that look like units sold
            const soldMatch = script.match(/(\d+)\s*(?:sold|units?|pieces?)/i);
            if (soldMatch) {
              return {
                unitsSold: soldMatch[1],
                price: null,
                shopName: null,
                productName: null,
                availability: null
              };
            }
          }
        } catch (e) {
          // Continue searching
        }
      }
    }

    // Try to find price information
    const priceMatch = html.match(/£(\d+\.?\d*)/);
    const price = priceMatch ? priceMatch[0] : null;

    // Try to find product name in title or meta tags
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const productName = titleMatch ? titleMatch[1].replace(/[|–-].*$/, '').trim() : null;

    // Try to find shop name
    const shopMatch = html.match(/shop[^>]*>([^<]+)</i);
    const shopName = shopMatch ? shopMatch[1].trim() : null;

    console.log('📋 Extracted basic data:', { price, productName, shopName });

    return {
      unitsSold: null,
      price,
      shopName,
      productName,
      availability: null
    };

  } catch (error) {
    console.error('❌ Error extracting product data:', error);
    return {
      unitsSold: null,
      price: null,
      shopName: null,
      productName: null,
      availability: null
    };
  }
}

function findProductInState(state, productId) {
  try {
    // Recursively search through the state object
    function searchObject(obj, path = '') {
      if (typeof obj !== 'object' || obj === null) return null;
      
      // Check if this object contains product data
      if (obj.productId === productId || obj.id === productId) {
        return {
          unitsSold: obj.unitsSold || obj.sold || obj.quantity || null,
          price: obj.price || obj.priceValue || null,
          shopName: obj.shopName || obj.shop?.name || null,
          productName: obj.name || obj.productName || null,
          availability: obj.availability || obj.inStock || null
        };
      }
      
      // Search in arrays and objects
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          for (const item of value) {
            const result = searchObject(item, `${path}.${key}[]`);
            if (result) return result;
          }
        } else if (typeof value === 'object') {
          const result = searchObject(value, `${path}.${key}`);
          if (result) return result;
        }
      }
      
      return null;
    }
    
    return searchObject(state);
  } catch (error) {
    console.error('❌ Error searching state:', error);
    return null;
  }
}
