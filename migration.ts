import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getLocalDb, getDsqlDb } from './server/db/index';

console.log('Migration started');

const target = process.argv.includes('--dsql') ? 'dsql' : 'local';
console.log(`Target: ${target}`);

const conn = target === 'dsql' ? await getDsqlDb() : getLocalDb();

try {
  await migrate(conn.db, { migrationsFolder: './drizzle/migrations' });
  console.log('Migration completed successfully.');
} finally {
  await conn.cleanup();
}
