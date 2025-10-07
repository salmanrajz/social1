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
        'cookie': '_ga=GA1.1.1881742864.1759043181; _ga_KW1C8BH7Q1=GS2.1.s1759063488$o3$g1$t1759063555$j57$l0$h0; __Host-next-auth.csrf-token=a94e8ab6ff9168567f058830865b30d19c4fc6486b91f324e97b3b3d7329029d%7C1021bc754a0c458bd4123d7e1a2c0f4e36609566ad7aa1a861322c660277e78e; __Secure-next-auth.callback-url=https%3A%2F%2Fwww.social1.ai%2Fsignin%3Fsession_id%3Dcs_live_b1ayzYZtJzTLv5gDvdBJQbM45ufEErT8cSNgSlnXTR6UzppDvqPiRJenG9; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Q0qhPRF2wDMi_TJf.Lr84cuzJ0c-zzyKnYcfDXWw179eItAMdddK_1h_skfEiVbyMPQlPBooQQN_HNWZvbkzhtEZUzQPNanMuS7KSS1maNIIMnWZ2ZRSq8p510mz645_aEA-BzIdSN9tWrlRrIeLVney0vfFuqXgRzQaIvC27tMVzvclq0G-7Oyb8ek44Mu_tg0Qlr8fZttKDNyLYfmnjKg6CaS3KfaOlExQ6DL0aGSgbFgza-O8Znrl_2g-VdhkSWyMhq0mVcG0wHyjQjWuzITTYEZhdelFAiL24_zm6EXC1cYHI3p1OQ8ub-Z4pRZDTpHTPtWN84fiuNxrZiGY4t7uZlVb8ddWan6hbgkZ6NDZRXe8pkiZNhdyuJ6W9guhFfd3bloANCc7_OA.rLb33E0DUG0SJfkrWiHbxA; ph_phc_LvsHwkuAh5ZkWAADNlrGGfG14aaUsBNwOckji9YooKX_posthog=%7B%22distinct_id%22%3A%2268e513b98343115e47e60b8e%22%2C%22%24sesid%22%3A%5B1759865431714%2C%220199c021-aafb-7d27-b50a-1a4b20417b26%22%2C1759865055995%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fwww.social1.ai%2F%22%7D%7D',
        'priority': 'u=1, i',
        'referer': 'https://www.social1.ai/',
        'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
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
