// Proxy API for TikTok trending products (hides actual endpoint)
const https = require('https');

// Your actual TikTok API configuration (keep this private)
const TIKTOK_API_CONFIG = {
  hostname: 'tiktok.wakanz.com',
  port: 443,
  headers: {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'cookie': '__Host-next-auth.csrf-token=64f312499e994880d224722ffc1b80687dad024564f0213cd5257f465bc0e83d%7C9a3cc9efff14182a7ea157bfa03a2e8d55f45fbc75817b56b7a8b85c0d4eff9b; __Secure-next-auth.callback-url=https%3A%2F%2Ftiktok.wakanz.com%2Fauth%2Fsignin%3FcallbackUrl%3Dhttps%253A%252F%252Ftiktok.wakanz.com%252F; site_password=777888; site_expires=1760894073430; site_duration=30 minutes; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Xn9xPJ2kggvCrTTz.03Dbq0fYI_Nuc6PlrSDiezbhLOQYE8WK9vHC9OaQJC5b_zabEyL_ScFeE9ij5SwxVejn6fb_MWaUuCLox9I-2leICzwY1xP7snKHIvCAwqLHamfZC4siWYwYQpSVWM4vQURgTS41QD89I4WNOrdwCumqTAZDOz229Uyu_g8WiXKv_-QJY88iI15mzWjwBqeYVQFBmDLKUOzzxxWFChb8TOlKPG-sxs86Qdbsc4lRfQQxAxjc39E2d9dZH4lFnM-WxdUxvT_JqWP4JvPGEGzartQgEnWIDV_AEnF95mTHE5Q.8y_n-f6a4r5bbP-Xz6TqFw',
    'priority': 'u=1, i',
    'referer': 'https://tiktok.wakanz.com/',
    'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
  }
};

// Forward request to actual TikTok API
async function forwardToTikTokAPI(queryParams) {
  return new Promise((resolve, reject) => {
    const path = `/api/videos?${queryParams}`;
    
    const options = {
      hostname: TIKTOK_API_CONFIG.hostname,
      port: TIKTOK_API_CONFIG.port,
      path: path,
      method: 'GET',
      headers: TIKTOK_API_CONFIG.headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            success: true,
            data: jsonData,
            statusCode: res.statusCode
          });
        } catch (error) {
          reject({
            success: false,
            error: 'Parse error: ' + error.message,
            statusCode: res.statusCode
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        success: false,
        error: 'Request error: ' + error.message,
        statusCode: 0
      });
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject({
        success: false,
        error: 'Request timeout',
        statusCode: 0
      });
    });
    
    req.end();
  });
}

// Main proxy handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET requests only.' 
    });
  }
  
  try {
    // Validate API key
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key required. Include X-API-Key header or Authorization: Bearer <key>'
      });
    }
    
    if (apiKey !== 'salmanrajzTiktok2025') {
      return res.status(403).json({
        success: false,
        error: 'Invalid API key. Contact us for access.'
      });
    }
    
    // Extract query parameters
    const { region = 'uk', days = '1', limit = '12', offset = '0' } = req.query;
    
    // Validate parameters
    if (limit > 50) {
      return res.status(400).json({
        success: false,
        error: 'Limit cannot exceed 50 per request'
      });
    }
    
    // Build query string
    const queryParams = new URLSearchParams({
      region,
      days,
      limit: limit.toString(),
      offset: offset.toString()
    }).toString();
    
    console.log(`🔄 Proxying request: ${queryParams}`);
    
    // Forward to TikTok API
    const result = await forwardToTikTokAPI(queryParams);
    
    if (result.success) {
      console.log(`✅ Proxy success: ${result.statusCode}`);
      return res.status(200).json({
        success: true,
        data: result.data,
        meta: {
          timestamp: new Date().toISOString(),
          region,
          days,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } else {
      console.log(`❌ Proxy error: ${result.error}`);
      return res.status(result.statusCode || 500).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('💥 Proxy handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
}




