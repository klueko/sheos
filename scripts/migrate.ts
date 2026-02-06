import { db, testConnection, runMigrations } from '../src/lib/db/index.js';

async function migrate() {
  console.log('🔄 Starting database migration...');
  
  // Test connection
  if (!testConnection()) {
    console.error('❌ Database connection failed');
    process.exit(1);
  }

  try {
    // Run migrations
    runMigrations();
    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrate().catch(console.error);
