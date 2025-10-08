require('dotenv').config();
const database = require('../lib/database');

async function testTursoDatabase() {
  console.log('🧪 Testing Turso database with custom adapter...');
  
  try {
    // Test basic connection
    const result = await database.execute('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    
    // Test user operations
    const testUserId = `test_${Date.now()}`;
    await database.createUser({
      id: testUserId,
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
    });
    console.log('✅ Test user created');
    
    // Test analytics
    await database.createAnalytics(testUserId, 'test_event', { test: true });
    console.log('✅ Analytics event created');
    
    // Test favorites
    await database.createFavorite(testUserId, 'test_item', 'video', { title: 'Test Video' });
    console.log('✅ Favorite created');
    
    // Test queries
    const user = await database.findUserById(testUserId);
    console.log('✅ User query successful:', user.name);
    
    const analytics = await database.getAnalytics(testUserId);
    console.log('✅ Analytics query successful:', analytics.length, 'events');
    
    const favorites = await database.getFavorites(testUserId);
    console.log('✅ Favorites query successful:', favorites.length, 'items');
    
    // Clean up
    await database.execute('DELETE FROM User WHERE id = ?', [testUserId]);
    await database.execute('DELETE FROM UserAnalytics WHERE userId = ?', [testUserId]);
    await database.execute('DELETE FROM UserFavorite WHERE userId = ?', [testUserId]);
    console.log('🧹 Test data cleaned up');
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await database.close();
  }
}

testTursoDatabase();
