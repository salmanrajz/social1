import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserResult = await client.execute(
      'SELECT * FROM User WHERE email = ?',
      [email]
    );

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user
    await client.execute(
      `INSERT INTO User (id, name, email, password, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [userId, name, email, hashedPassword]
    );

    // Create user profile
    const profileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await client.execute(
      `INSERT INTO UserProfile (id, userId, preferences) 
       VALUES (?, ?, ?)`,
      [profileId, userId, JSON.stringify({
        theme: 'light',
        region: 'uk',
        notifications: true,
        autoRefresh: false,
        compactView: false,
      })]
    );

    return NextResponse.json(
      { message: 'User created successfully', userId: userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
