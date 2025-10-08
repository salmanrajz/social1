const { createClient } = require('@libsql/client');
require('dotenv').config();

async function setupDatabase() {
  console.log('🗄️ Setting up Turso database...');
  
  const databaseUrl = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  console.log('📋 Database URL:', databaseUrl ? 'Set' : 'Not set');
  console.log('🔑 Auth Token:', authToken ? 'Set' : 'Not set');
  
  if (!databaseUrl || !authToken) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }
  
  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  try {
    // Read the SQL file
    const fs = require('fs');
    const path = require('path');
    const sqlFile = path.join(__dirname, 'setup-database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📋 Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await client.execute(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
        } catch (error) {
          console.log(`⚠️  Statement ${i + 1} warning:`, error.message);
        }
      }
    }

    console.log('🎉 Database setup complete!');
    
    // Test the connection
    const result = await client.execute('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('📊 Tables created:', result.rows.map(row => row.name));

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
