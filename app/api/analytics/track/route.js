import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, event, data, timestamp } = await request.json();

    if (!userId || !event) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Store analytics event in database
    const analyticsId = `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const eventTimestamp = timestamp || new Date().toISOString();
    await client.execute(
      `INSERT INTO UserAnalytics (id, userId, eventType, eventData, timestamp) 
       VALUES (?, ?, ?, ?, ?)`,
      [analyticsId, userId, event, JSON.stringify(data), eventTimestamp]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
