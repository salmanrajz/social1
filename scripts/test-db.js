require('dotenv').config();
const prisma = require('../lib/prisma');

async function testDatabase() {
  console.log('🧪 Testing Turso database connection...');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);
    
    // Test creating a test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
    console.log('✅ Test user created:', testUser.id);
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log('🧹 Test user cleaned up');
    
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
