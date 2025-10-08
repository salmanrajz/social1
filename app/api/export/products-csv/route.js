import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 3;
    
    // Fetch top products data from the last 3 days
    const social1ApiUrl = 'https://social1.ai/api/v1/topViralProducts';
    const response = await fetch(social1ApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzM4YjQ4YzQ4YjQ4YzQ4YjQ4YzQ4YzQiLCJpYXQiOjE3MzY5NzQ4MDB9.example'
      },
      body: JSON.stringify({
        days: days,
        limit: 1000, // Get more products for comprehensive data
        region: 'uk'
      })
    });

    if (!response.ok) {
      throw new Error(`Social1 API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid data format from Social1 API');
    }

    const products = data.data;

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
        index + 1, // Rank
        `"${(product.product_name || '').replace(/"/g, '""')}"`, // Product Name (escaped)
        product.product_id || '',
        product.price || '',
        `"${(product.price_display || '').replace(/"/g, '""')}"`, // Price Display (escaped)
        `"${(product.shop?.shop_name || '').replace(/"/g, '""')}"`, // Shop Name (escaped)
        product.shop?.shop_id || '',
        product.gmv || '',
        product.units_sold || '',
        product.product_image || '',
        `"${(product.category || '').replace(/"/g, '""')}"`, // Category (escaped)
        product.region || '',
        product.timestamp || '',
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
