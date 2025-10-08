import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Alternative approach: Try to use TikTok's internal API
    const apiUrl = `https://shop.tiktok.com/api/product/detail/?product_id=${productId}`;
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': `https://shop.tiktok.com/view/product/${productId}`,
          'Origin': 'https://shop.tiktok.com',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Extract data from TikTok's API response
        const extractedData = {
          unitsSold: data.data?.sold_count || data.data?.soldCount || null,
          price: data.data?.price || data.data?.price_display || null,
          shopName: data.data?.shop_name || data.data?.shopName || null,
          productName: data.data?.title || data.data?.product_name || null,
          availability: data.data?.stock_status || data.data?.availability || null,
          description: data.data?.description || null,
          images: data.data?.images || null,
          rating: data.data?.rating || null,
          reviewCount: data.data?.review_count || null
        };

        return NextResponse.json({
          success: true,
          productId,
          source: 'tiktok-api',
          data: extractedData,
          timestamp: new Date().toISOString()
        });
      }
    } catch (apiError) {
      console.log('TikTok API approach failed, trying alternative...');
    }

    // Fallback: Try to get basic info from the page title and meta tags
    const shopUrl = `https://shop.tiktok.com/view/product/${productId}`;
    
    try {
      const response = await fetch(shopUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
      });

      if (response.ok) {
        const html = await response.text();
        
        // Extract basic info from meta tags and title
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i);
        const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i);
        const ogDescriptionMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/i);
        
        const extractedData = {
          productName: titleMatch ? titleMatch[1].replace(' | TikTok Shop', '').trim() : null,
          description: descriptionMatch ? descriptionMatch[1] : (ogDescriptionMatch ? ogDescriptionMatch[1] : null),
          unitsSold: null,
          price: null,
          shopName: null,
          availability: null,
          fallback: true,
          note: 'Limited data available - TikTok Shop may require JavaScript to load full product information'
        };

        return NextResponse.json({
          success: true,
          productId,
          source: 'meta-tags',
          data: extractedData,
          timestamp: new Date().toISOString()
        });
      }
    } catch (fallbackError) {
      console.error('Fallback approach also failed:', fallbackError);
    }

    // Final fallback
    return NextResponse.json({
      success: false,
      productId,
      error: 'Unable to fetch data from TikTok Shop',
      suggestions: [
        'TikTok Shop may require JavaScript to load product data',
        'The product may not be publicly accessible',
        'Rate limiting or anti-bot measures may be in place'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('TikTok shop alternative API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
