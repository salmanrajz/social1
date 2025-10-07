import { NextResponse } from 'next/server';

const PASSWORDS = {
  '777888': { duration: 30, label: '30 minutes' },  // 30 minutes
  '888AAA': { duration: 60, label: '1 hour' }       // 60 minutes (1 hour)
};

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (PASSWORDS[password]) {
      const { duration, label } = PASSWORDS[password];
      return NextResponse.json({ 
        success: true, 
        duration,
        durationLabel: label
      });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

