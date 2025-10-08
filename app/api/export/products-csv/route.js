import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 3;
    
    // Fetch real data from our working API endpoint
    const internalApiUrl = new URL('http://localhost:3000/api/products/top');
    internalApiUrl.searchParams.set('days', days);
    internalApiUrl.searchParams.set('limit', '1000');
    internalApiUrl.searchParams.set('region', 'uk');
    internalApiUrl.searchParams.set('offset', '0');

    const response = await fetch(internalApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Internal API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', { dataLength: data.results?.length });
    
    if (!data.results || !Array.isArray(data.results)) {
      console.error('Invalid data format:', data);
      throw new Error('Invalid data format from API');
    }

    const products = data.results;

    // Create CSV headers
    const csvHeaders = [
      'Rank',
      'Product Name',
      'Product ID',
      'Price',
      'Price Display',
      'Shop Name',
      'Shop ID',
      'GMV',
      'Units Sold',
      'Product Image URL',
      'Category',
      'Region',
      'Timestamp',
      'Viral Score',
      'Trending Score'
    ];

    // Convert products to CSV rows
    const csvRows = products.map((product, index) => {
      const viralScore = product.gmv 
        ? Math.min(100, Math.round((parseFloat(product.gmv) / 10000) + 50))
        : 50;
      
      const trendingScore = product.gmv 
        ? Math.min(100, Math.round((parseFloat(product.gmv) / 5000) + 60))
        : 60;

      return [
        product.ranking || (index + 1), // Use ranking from API or fallback to index
        `"${(product.name || '').replace(/"/g, '""')}"`, // Product name
        product.product_id || '',
        product.price_value || '',
        `"${(product.price_display || '').replace(/"/g, '""')}"`, // Price display
        `"${(product.shop?.shop_name || '').replace(/"/g, '""')}"`, // Shop name
        product.shop?.shop_id || '',
        product.gmv || '',
        product.units_sold || '',
        product.product_img_url || '',
        `"${(product.top_category || '').replace(/"/g, '""')}"`, // Category
        'UK', // Region
        product.last_updated || '',
        viralScore,
        trendingScore
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `top-products-last-${days}-days-${timestamp}.csv`;

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export CSV', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}