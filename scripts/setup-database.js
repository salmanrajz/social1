const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');

    // Create UserAnalytics table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS UserAnalytics (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        eventType TEXT NOT NULL,
        eventData TEXT,
        timestamp TEXT NOT NULL
      )
    `);

    // Create User table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        emailVerified TEXT,
        image TEXT,
        password TEXT,
        pushSubscription TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Create UserProfile table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS UserProfile (
        id TEXT PRIMARY KEY,
        userId TEXT UNIQUE NOT NULL,
        bio TEXT,
        preferences TEXT,
        settings TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Create UserFavorite table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS UserFavorite (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        itemId TEXT NOT NULL,
        itemType TEXT NOT NULL,
        itemData TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        UNIQUE(userId, itemId, itemType)
      )
    `);

    console.log('✅ Database tables created successfully!');
    
    // Test the UserAnalytics table
    const testResult = await client.execute(`
      INSERT INTO UserAnalytics (id, userId, eventType, eventData, timestamp) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      'test_123',
      'user_123', 
      'test_event',
      JSON.stringify({test: 'data'}),
      new Date().toISOString()
    ]);
    
    console.log('✅ Test insert successful!');
    
    // Clean up test data
    await client.execute('DELETE FROM UserAnalytics WHERE id = ?', ['test_123']);
    console.log('✅ Test data cleaned up!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

setupDatabase();
