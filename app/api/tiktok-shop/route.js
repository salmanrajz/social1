import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // TikTok Shop product URL
    const shopUrl = `https://www.tiktok.com/shop/gb/pdp/${productId}`;
    
    try {
      // Fetch the product page
      const response = await fetch(shopUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      
      // Extract data using improved patterns
      const extractData = (html) => {
        const data = {
          unitsSold: null,
          price: null,
          shopName: null,
          productName: null,
          availability: null,
          debug: {
            htmlLength: html.length,
            hasJsonLd: /application\/ld\+json/.test(html),
            hasScriptTags: (html.match(/<script/g) || []).length,
            sampleContent: html.substring(0, 500)
          }
        };

        try {
          // Try to extract JSON-LD structured data
          const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
          if (jsonLdMatches) {
            for (const match of jsonLdMatches) {
              try {
                const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
                const jsonData = JSON.parse(jsonContent);
                
                if (jsonData.offers) {
                  data.price = jsonData.offers.price;
                  data.availability = jsonData.offers.availability;
                }
                if (jsonData.name) {
                  data.productName = jsonData.name;
                }
                if (jsonData.brand) {
                  data.shopName = jsonData.brand.name;
                }
              } catch (e) {
                // Continue to next JSON-LD block
              }
            }
          }

          // Try to extract from window.__INITIAL_STATE__ or similar
          const initialStateMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/s);
          if (initialStateMatch) {
            try {
              const initialState = JSON.parse(initialStateMatch[1]);
              // Navigate through the state to find product data
              if (initialState.product) {
                data.unitsSold = initialState.product.soldCount || initialState.product.unitsSold;
                data.price = initialState.product.price;
                data.shopName = initialState.product.shopName;
                data.productName = initialState.product.title;
              }
            } catch (e) {
              // Continue with other methods
            }
          }

          // Try to extract from various script tags with product data
          const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gs);
          if (scriptMatches) {
            for (const script of scriptMatches) {
              const content = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
              
              // Look for product data patterns
              const productDataPatterns = [
                /"soldCount":\s*(\d+)/g,
                /"unitsSold":\s*(\d+)/g,
                /"sold_count":\s*(\d+)/g,
                /"price":\s*"([^"]+)"/g,
                /"shopName":\s*"([^"]+)"/g,
                /"title":\s*"([^"]+)"/g
              ];

              for (const pattern of productDataPatterns) {
                const matches = [...content.matchAll(pattern)];
                for (const match of matches) {
                  if (pattern.source.includes('soldCount') || pattern.source.includes('unitsSold') || pattern.source.includes('sold_count')) {
                    data.unitsSold = parseInt(match[1]);
                  } else if (pattern.source.includes('price')) {
                    data.price = match[1];
                  } else if (pattern.source.includes('shopName')) {
                    data.shopName = match[1];
                  } else if (pattern.source.includes('title')) {
                    data.productName = match[1];
                  }
                }
              }
            }
          }

          // Try to extract from HTML text content
          const textContent = html.replace(/<script[^>]*>.*?<\/script>/gs, '').replace(/<[^>]*>/g, ' ');
          
          // Look for sold patterns in text
          const soldPatterns = [
            /(\d+)\s*sold/gi,
            /(\d+)\s*units?\s*sold/gi,
            /sold\s*(\d+)/gi,
            /(\d+)\s*people\s*bought/gi
          ];

          for (const pattern of soldPatterns) {
            const match = textContent.match(pattern);
            if (match) {
              const numberMatch = match[0].match(/\d+/);
              if (numberMatch) {
                data.unitsSold = parseInt(numberMatch[0]);
                break;
              }
            }
          }

          // Look for price patterns
          const pricePatterns = [
            /\$(\d+\.?\d*)/g,
            /USD\s*(\d+\.?\d*)/g,
            /price[^:]*:\s*\$?(\d+\.?\d*)/gi
          ];

          for (const pattern of pricePatterns) {
            const match = textContent.match(pattern);
            if (match) {
              data.price = match[0].replace(/[^\d.]/g, '');
              break;
            }
          }

        } catch (error) {
          console.error('Error parsing HTML:', error);
          data.debug.error = error.message;
        }

        return data;
      };

      const extractedData = extractData(html);

      return NextResponse.json({
        success: true,
        productId,
        shopUrl,
        data: extractedData,
        timestamp: new Date().toISOString()
      });

    } catch (fetchError) {
      console.error('Error fetching TikTok shop data:', fetchError);
      
      // Return fallback data
      return NextResponse.json({
        success: false,
        productId,
        shopUrl,
        error: 'Unable to fetch real-time data from TikTok shop',
        fallback: {
          message: 'Real-time data unavailable',
          suggestion: 'Visit the TikTok shop directly for current information'
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('TikTok shop API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
