import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET(request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user analytics data
    const analyticsResult = await client.execute(
      `SELECT * FROM UserAnalytics 
       WHERE userId = ? AND timestamp >= ? 
       ORDER BY timestamp DESC`,
      [userId, startDate.toISOString()]
    );
    const analytics = analyticsResult.rows;

    // Process analytics data
    const stats = {
      totalEvents: analytics.length,
      pageViews: analytics.filter(a => a.eventType === 'page_view').length,
      videoClicks: analytics.filter(a => a.eventType === 'video_click').length,
      productClicks: analytics.filter(a => a.eventType === 'product_click').length,
      searches: analytics.filter(a => a.eventType === 'search').length,
      favorites: analytics.filter(a => a.eventType === 'favorite').length,
      shares: analytics.filter(a => a.eventType === 'share').length,
    };

    // Get daily activity
    const dailyActivity = {};
    analytics.forEach(analytics => {
      const date = new Date(analytics.timestamp).toISOString().split('T')[0];
      if (!dailyActivity[date]) {
        dailyActivity[date] = 0;
      }
      dailyActivity[date]++;
    });

    // Get most popular content
    const videoClicks = analytics.filter(a => a.eventType === 'video_click');
    const productClicks = analytics.filter(a => a.eventType === 'product_click');
    
    const popularVideos = {};
    const popularProducts = {};

    videoClicks.forEach(click => {
      const data = JSON.parse(click.eventData);
      const videoId = data.videoId;
      if (!popularVideos[videoId]) {
        popularVideos[videoId] = { count: 0, data: data };
      }
      popularVideos[videoId].count++;
    });

    productClicks.forEach(click => {
      const data = JSON.parse(click.eventData);
      const productId = data.productId;
      if (!popularProducts[productId]) {
        popularProducts[productId] = { count: 0, data: data };
      }
      popularProducts[productId].count++;
    });

    // Get search queries
    const searchQueries = analytics
      .filter(a => a.eventType === 'search')
      .map(a => JSON.parse(a.eventData).query)
      .filter(Boolean);

    // Get favorite items
    const favoriteItems = analytics
      .filter(a => a.eventType === 'favorite' && JSON.parse(a.eventData).action === 'add')
      .map(a => JSON.parse(a.eventData));

    return NextResponse.json({
      stats,
      dailyActivity,
      popularVideos: Object.entries(popularVideos)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 10)
        .map(([id, data]) => ({ id, ...data })),
      popularProducts: Object.entries(popularProducts)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 10)
        .map(([id, data]) => ({ id, ...data })),
      searchQueries: [...new Set(searchQueries)].slice(0, 10),
      favoriteItems: favoriteItems.slice(0, 10),
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
