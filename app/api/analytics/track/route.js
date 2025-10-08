import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    await prisma.userAnalytics.create({
      data: {
        userId,
        event,
        data: JSON.stringify(data),
        timestamp: new Date(timestamp),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
