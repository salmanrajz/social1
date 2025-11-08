import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '12';
    const offset = searchParams.get('offset') || '0';
    const days = searchParams.get('days') || '1';
    const region = searchParams.get('region') || 'us';
    const productID = searchParams.get('productID');

    // Build the Social1 API URL with query parameters
    const apiUrl = new URL('https://www.social1.ai/api/videos/getTopVideos');
    apiUrl.searchParams.set('limit', limit);
    apiUrl.searchParams.set('offset', offset);
    apiUrl.searchParams.set('days', days);
    apiUrl.searchParams.set('region', region);
    
    // Add productID if provided
    if (productID) {
      apiUrl.searchParams.set('productID', productID);
    }

    // Make the request to Social1 API with the same headers as your curl command
    const SOCIAL1_COOKIE = process.env.SOCIAL1_COOKIE || process.env.TIKTOK_COOKIE;
    const SOCIAL1_USER_AGENT = process.env.SOCIAL1_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
    const SOCIAL1_SEC_CH_UA = process.env.SOCIAL1_SEC_CH_UA || '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"';

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
        'referer': 'https://www.social1.ai/',
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
      throw new Error(`Social1 API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Return the data with CORS headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: error.message },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
