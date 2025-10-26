// Test database connection
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'chatvocusdb.mysql.database.azure.com',
  port: 3306,
  user: 'salmanrajz',
  password: '@Xuj0324!!!',
  database: 'duquickpay',
  ssl: { rejectUnauthorized: false }
};

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    
    const connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Database connected successfully!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', rows);
    
    // Check if table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'daily_trending_products'"
    );
    
    if (tables.length > 0) {
      console.log('✅ Table daily_trending_products exists');
      
      // Get table info
      const [tableInfo] = await connection.execute(
        'DESCRIBE daily_trending_products'
      );
      console.log('📋 Table structure:');
      tableInfo.forEach(row => {
        console.log(`  ${row.Field.padEnd(20)} ${row.Type.padEnd(20)} ${row.Null} ${row.Key}`);
      });
    } else {
      console.log('⚠️ Table daily_trending_products does not exist');
    }
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();




