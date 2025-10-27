// Private configuration file - DO NOT UPLOAD TO GITHUB
// This contains the actual Social1 API details

module.exports = {
  social1Api: {
    baseUrl: 'https://tiktok.wakanz.com/api/videos',
    cookies: '__Host-next-auth.csrf-token=64f312499e994880d224722ffc1b80687dad024564f0213cd5257f465bc0e83d%7C9a3cc9efff14182a7ea157bfa03a2e8d55f45fbc75817b56b7a8b85c0d4eff9b; __Secure-next-auth.callback-url=https%3A%2F%2Ftiktok.wakanz.com%2Fauth%2Fsignin%3FcallbackUrl%3Dhttps%253A%252F%252Ftiktok.wakanz.com%252F; site_password=777888; site_expires=1760894073430; site_duration=30 minutes; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Xn9xPJ2kggvCrTTz.03Dbq0fYI_Nuc6PlrSDiezbhLOQYE8WK9vHC9OaQJC5b_zabEyL_ScFeE9ij5SwxVejn6fb_MWaUuCLox9I-2leICzwY1xP7snKHIvCAwqLHamfZC4siWYwYQpSVWM4vQURgTS41QD89I4WNOrdwCumqTAZDOz229Uyu_g8WiXKv_-QJY88iI15mzWjwBqeYVQFBmDLKUOzzxxWFChb8TOlKPG-sxs86Qdbsc4lRfQQxAxjc39E2d9dZH4lFnM-WxdUxvT_JqWP4JvPGEGzartQgEnWIDV_AEnF95mTHE5Q.8y_n-f6a4r5bbP-Xz6TqFw',
    headers: {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
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
  },
  
  // Your Supabase details
  supabase: {
    url: 'https://edgitshcqelilcjkndho.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZ2l0c2hjcWVsaWxjamtuZGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTExMzksImV4cCI6MjA3Njk4NzEzOX0.rgethMENBCp6F57GAyQknSZjmKdxpQaoJcr6BYOUIq8'
  }
};
