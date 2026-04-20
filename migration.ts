import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getLocalDb, getDsqlDb } from './server/db/index';
import { dsqlMigrate } from './server/db/dsql-migrator';

console.log('Migration started');

const target = process.argv.includes('--dsql') ? 'dsql' : 'local';
console.log(`Target: ${target}`);

const conn = target === 'dsql' ? await getDsqlDb() : getLocalDb();

try {
  if (target === 'dsql') {
    await dsqlMigrate(conn.db, './drizzle/migrations');
  } else {
    await migrate(conn.db, { migrationsFolder: './drizzle/migrations' });
  }
  console.log('Migration completed successfully.');
} finally {
  await conn.cleanup();
}
