import { NextResponse } from 'next/server';

const PASSWORDS = {
  'Salman123!!!': { duration: 30, label: '30 minutes' },  // 30 minutes
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

