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
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': '_ga=GA1.1.1881742864.1759043181; _ga_KW1C8BH7Q1=GS2.1.s1759063488$o3$g1$t1759063555$j57$l0$h0; __Host-next-auth.csrf-token=a94e8ab6ff9168567f058830865b30d19c4fc6486b91f324e97b3b3d7329029d%7C1021bc754a0c458bd4123d7e1a2c0f4e36609566ad7aa1a861322c660277e78e; __Secure-next-auth.callback-url=https%3A%2F%2Fwww.social1.ai%2Fsignin%3Fsession_id%3Dcs_live_b1GUfefKXAib1li2Rh6TWJs595P3YfkOfkKMwMO9dM4eskq2DPVHuC97gY; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..9WvuQ6QdzElE_C9V.PxTF2qAt4hT8n_jRffls30TsaQlyFFjo1MaB2fIlqVVVyJ4i8zSuC-9n0EnsGtV_5o-GzNfy-HaMbOy5ZSV_EEkqi_wIeU52zQQT9-F3_6sjgvdFuJyi9JGPh0SKjSw7pgFt33LkBQMouStRKCTB5FYGn6AS5aLpOociWyEq7JwGVExz8QBnL39sR9pXmT1pFnKWO1Qy4cnbCReUxTrlfK5iZ8uqVsnnZM3hYqSdAHYhr6hWd5qyn8cOabQ_pvKXurHYD9EAqjYKa8p57LRbrmqR2CMktq70EezLoZMwfk4NtGqTbPOAWFlCoulKwnGgB2zbW-ZrNwh9KAzHrisuS32oK2AibseZZXMaNrT3SKTyFcfteG-TM_SgQF2EWg.L4tI0c4oHfE9h-4k8pP_4A; ph_phc_LvsHwkuAh5ZkWAADNlrGGfG14aaUsBNwOckji9YooKX_posthog=%7B%22distinct_id%22%3A%2268e513b98343115e47e60b8e%22%2C%22%24sesid%22%3A%5B1762583005155%2C%22019a6212-3671-722d-af61-61a996a85797%22%2C1762581952113%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fwww.social1.ai%2F%22%7D%7D',
        'priority': 'u=1, i',
        'referer': 'https://www.social1.ai/',
        'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
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
