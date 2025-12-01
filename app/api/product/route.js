import { NextResponse } from 'next/server';

// Special access code - can be set via environment variable
const ACCESS_CODE = process.env.PRODUCT_API_ACCESS_CODE || 'salmanrajz';

// Helper function to get CORS headers (allow all origins)
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Access-Code, Access-Code',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

// Helper function to check access code
function checkAccessCode(request) {
  // Check query parameter (for GET requests)
  const { searchParams } = new URL(request.url);
  const codeFromQuery = searchParams.get('code') || searchParams.get('access_code');
  
  // Check header (for GET/POST requests)
  const codeFromHeader = request.headers.get('x-access-code') || request.headers.get('access-code');
  
  // Check POST body (for POST requests)
  let codeFromBody = null;
  
  return codeFromQuery || codeFromHeader || codeFromBody;
}

export async function GET(request) {
  try {
    // Check access code authentication
    const providedCode = checkAccessCode(request);
    if (!providedCode || providedCode !== ACCESS_CODE) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing access code' },
        { 
          status: 401,
          headers: getCorsHeaders()
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '12';
    const offset = searchParams.get('offset') || '0';
    const days = searchParams.get('days') || '1';
    const region = searchParams.get('region') || 'uk';

    // Build the Social1 API URL with query parameters
    const apiUrl = new URL('https://www.social1.ai/api/products/getTopProducts');
    apiUrl.searchParams.set('limit', limit);
    apiUrl.searchParams.set('offset', offset);
    apiUrl.searchParams.set('days', days);
    apiUrl.searchParams.set('region', region);

    // Make the request to Social1 API with the same headers as your curl command
    const SOCIAL1_COOKIE = process.env.SOCIAL1_COOKIE || process.env.TIKTOK_COOKIE;
    const SOCIAL1_USER_AGENT = process.env.SOCIAL1_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';
    const SOCIAL1_SEC_CH_UA = process.env.SOCIAL1_SEC_CH_UA || '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"';

    if (!SOCIAL1_COOKIE) {
      throw new Error('SOCIAL1_COOKIE environment variable is not set');
    }

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': SOCIAL1_COOKIE,
        'priority': 'u=1, i',
        'referer': 'https://www.social1.ai/products',
        'sec-ch-ua': SOCIAL1_SEC_CH_UA,
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': SOCIAL1_USER_AGENT
      }
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = response.statusText;
      try {
        const errorText = await response.text();
        if (errorText) {
          errorDetails = errorText.substring(0, 500); // Limit error text length
        }
      } catch (e) {
        // Ignore if we can't read error body
      }
      console.error(`Social1 API error (${response.status}):`, errorDetails);
      console.error('Request URL:', apiUrl.toString());
      throw new Error(`Social1 API request failed: ${response.status} ${errorDetails}`);
    }

    const data = await response.json();

    // Return the data with CORS headers
    return NextResponse.json(data, {
      status: 200,
      headers: getCorsHeaders(),
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { 
        status: 500,
        headers: getCorsHeaders()
      }
    );
  }
}

// Handle POST requests
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    
    // Check access code from body or header
    const codeFromBody = body.code || body.access_code;
    const codeFromHeader = request.headers.get('x-access-code') || request.headers.get('access-code');
    const providedCode = codeFromBody || codeFromHeader;
    
    // Check access code authentication
    if (!providedCode || providedCode !== ACCESS_CODE) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing access code' },
        { 
          status: 401,
          headers: getCorsHeaders()
        }
      );
    }

    const limit = body.limit || '12';
    const offset = body.offset || '0';
    const days = body.days || '1';
    const region = body.region || 'uk';

    // Build the Social1 API URL with query parameters
    const apiUrl = new URL('https://www.social1.ai/api/products/getTopProducts');
    apiUrl.searchParams.set('limit', limit);
    apiUrl.searchParams.set('offset', offset);
    apiUrl.searchParams.set('days', days);
    apiUrl.searchParams.set('region', region);

    // Make the request to Social1 API with the same headers as your curl command
    const SOCIAL1_COOKIE = process.env.SOCIAL1_COOKIE || process.env.TIKTOK_COOKIE;
    const SOCIAL1_USER_AGENT = process.env.SOCIAL1_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';
    const SOCIAL1_SEC_CH_UA = process.env.SOCIAL1_SEC_CH_UA || '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"';

    if (!SOCIAL1_COOKIE) {
      throw new Error('SOCIAL1_COOKIE environment variable is not set');
    }

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': SOCIAL1_COOKIE,
        'priority': 'u=1, i',
        'referer': 'https://www.social1.ai/products',
        'sec-ch-ua': SOCIAL1_SEC_CH_UA,
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': SOCIAL1_USER_AGENT
      }
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = response.statusText;
      try {
        const errorText = await response.text();
        if (errorText) {
          errorDetails = errorText.substring(0, 500);
        }
      } catch (e) {
        // Ignore if we can't read error body
      }
      console.error(`Social1 API error (${response.status}):`, errorDetails);
      console.error('Request URL:', apiUrl.toString());
      throw new Error(`Social1 API request failed: ${response.status} ${errorDetails}`);
    }

    const data = await response.json();

    // Return the data with CORS headers
    return NextResponse.json(data, {
      status: 200,
      headers: getCorsHeaders(),
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { 
        status: 500,
        headers: getCorsHeaders()
      }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

