import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const region = searchParams.get('region') || 'uk';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const apiUrl = new URL('https://www.social1.ai/api/shops/search');
    apiUrl.searchParams.set('query', query);
    apiUrl.searchParams.set('region', region);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'cookie': '_ga=GA1.1.1881742864.1759043181; _ga_KW1C8BH7Q1=GS2.1.s1759063488$o3$g1$t1759063555$j57$l0$h0; __Host-next-auth.csrf-token=a94e8ab6ff9168567f058830865b30d19c4fc6486b91f324e97b3b3d7329029d%7C1021bc754a0c458bd4123d7e1a2c0f4e36609566ad7aa1a861322c660277e78e; __Secure-next-auth.callback-url=https%3A%2F%2Fwww.social1.ai%2Fsignin%3Fsession_id%3Dcs_live_b1ayzYZtJzTLv5gDvdBJQbM45ufEErT8cSNgSlnXTR6UzppDvqPiRJenG9; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..bJUB7acVjSk4VolK.AVcEG7cvanNgXrnxrBcwF6bec36V7KiWwKtHIrj10suz-eR8A-mye5nvsiTtFNqZVxPCE9E6VAwJtDGVYMDm-4RP2n6G_iYqurCmRXthMzp7h3M1epeNcMR5Cnl2q2rL3geJ9Tp57jiZNuohBvAGmOSUWFexS_EFEzw9aZaAojKRMAZ3YTZ-LvlbPAtxJqTpMnEsKmby05_vahBGrZIP4mjBJ-Xy5a-ihQAaxPQsP13T44bjTN_BSvHXfcR2Q9jbXDQe222CLRwBDubkBkENCSefjEMOgzLcBnDz6fRPQIyYvQ2oZPEc18Nf30riDJOCocHdQA2ia59XDSbjARs206cebDU4EL0sV8vcM9vkI_IWUWJ9J6p2ckOThLQf2Q.EEOU0vidrF7o3E3jmQJznw; ph_phc_LvsHwkuAh5ZkWAADNlrGGfG14aaUsBNwOckji9YooKX_posthog=%7B%22distinct_id%22%3A%2268e513b98343115e47e60b8e%22%2C%22%24sesid%22%3A%5B1759877087608%2C%220199c0c7-5b18-7509-ad6a-7191e58aa0c8%22%2C1759875914517%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22https%3A%2F%2Fwww.social1.ai%2F%22%7D%7D',
        'priority': 'u=1, i',
        'referer': 'https://www.social1.ai/products',
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
      throw new Error(\`Social1 API request failed: \${response.status} \${response.statusText}\`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error searching shops:", error);
    return NextResponse.json({ error: "Failed to search shops", details: error.message }, { status: 500 });
  }
}
