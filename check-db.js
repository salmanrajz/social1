// Check database and run a simple test
const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'chatvocusdb.mysql.database.azure.com',
  port: 3306,
  user: 'salmanrajz',
  password: '@Xuj0324!!!',
  database: 'duquickpay',
  ssl: { rejectUnauthorized: false }
};

async function checkDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Database connected successfully!');
    
    // Check if table exists
    console.log('\n📋 Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables found:', tables.map(t => Object.values(t)[0]));
    
    // Check if our table exists
    const [ourTable] = await connection.execute(
      "SHOW TABLES LIKE 'daily_trending_products'"
    );
    
    if (ourTable.length > 0) {
      console.log('✅ Table daily_trending_products exists');
      
      // Check table structure
      const [columns] = await connection.execute('DESCRIBE daily_trending_products');
      console.log('\n📊 Table structure:');
      columns.forEach(col => {
        console.log(`  ${col.Field.padEnd(20)} ${col.Type.padEnd(20)} ${col.Null} ${col.Key}`);
      });
      
      // Check data count
      const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM daily_trending_products');
      console.log(`\n📊 Total records: ${countResult[0].count}`);
      
      // Check data by date
      const [dateData] = await connection.execute(`
        SELECT collection_date, COUNT(*) as count 
        FROM daily_trending_products 
        GROUP BY collection_date 
        ORDER BY collection_date DESC 
        LIMIT 5
      `);
      
      if (dateData.length > 0) {
        console.log('\n📅 Data by date:');
        dateData.forEach(row => {
          console.log(`  ${row.collection_date}: ${row.count} products`);
        });
        
        // Show sample data
        const [sampleData] = await connection.execute(`
          SELECT ranking, product_name, gmv, views 
          FROM daily_trending_products 
          ORDER BY collection_date DESC, ranking ASC 
          LIMIT 5
        `);
        
        console.log('\n🏆 Sample data:');
        sampleData.forEach(row => {
          console.log(`  Rank ${row.ranking}: ${row.product_name?.substring(0, 50) || 'Unknown'}...`);
          console.log(`    GMV: £${(parseFloat(row.gmv) || 0).toLocaleString()}, Views: ${(row.views || 0).toLocaleString()}`);
        });
      } else {
        console.log('⚠️ No data found in table');
      }
      
    } else {
      console.log('❌ Table daily_trending_products does not exist');
    }
    
    await connection.end();
    console.log('\n✅ Database check complete');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkDatabase();




