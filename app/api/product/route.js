import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '12';
    const offset = searchParams.get('offset') || '0';
    const days = searchParams.get('days') || '1';
    const region = searchParams.get('region') || 'uk';

    // Build the TikTok Wakanz API URL with query parameters
    const apiUrl = new URL('https://tiktok.wakanz.com/api/product');
    apiUrl.searchParams.set('limit', limit);
    apiUrl.searchParams.set('offset', offset);
    apiUrl.searchParams.set('days', days);
    apiUrl.searchParams.set('region', region);

    // Get cookie from environment or use default
    const TIKTOK_COOKIE = process.env.TIKTOK_COOKIE || process.env.SOCIAL1_COOKIE || '__Host-next-auth.csrf-token=64f312499e994880d224722ffc1b80687dad024564f0213cd5257f465bc0e83d%7C9a3cc9efff14182a7ea157bfa03a2e8d55f45fbc75817b56b7a8b85c0d4eff9b; __Secure-next-auth.callback-url=https%3A%2F%2Ftiktok.wakanz.com%2Fauth%2Fsignin%3FcallbackUrl%3Dhttps%253A%252F%252Ftiktok.wakanz.com%252F; site_password=Salman123!!!; site_expires=1760894073430; site_duration=30 minutes; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Xn9xPJ2kggvCrTTz.03Dbq0fYI_Nuc6PlrSDiezbhLOQYE8WK9vHC9OaQJC5b_zabEyL_ScFeE9ij5SwxVejn6fb_MWaUuCLox9I-2leICzwY1xP7snKHIvCAwqLHamfZC4siWYwYQpSVWM4vQURgTS41QD89I4WNOrdwCumqTAZDOz229Uyu_g8WiXKv_-QJY88iI15mzWjwBqeYVQFBmDLKUOzzxxWFChb8TOlKPG-sxs86Qdbsc4lRfQQxAxjc39E2d9dZH4lFnM-WxdUxvT_JqWP4JvPGEGzartQgEnWIDV_AEnF95mTHE5Q.8y_n-f6a4r5bbP-Xz6TqFw';

    const TIKTOK_USER_AGENT = process.env.TIKTOK_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': TIKTOK_COOKIE,
        'priority': 'u=1, i',
        'referer': 'https://tiktok.wakanz.com/',
        'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': TIKTOK_USER_AGENT
      }
    });

    if (!response.ok) {
      throw new Error(`TikTok Wakanz API request failed: ${response.status} ${response.statusText}`);
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
    console.error('Error fetching products from TikTok Wakanz:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
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

