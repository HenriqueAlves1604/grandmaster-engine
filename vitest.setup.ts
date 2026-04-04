import 'dotenv/config';
import { execSync } from 'node:child_process';
import process from 'node:process';

export function setup() {
  console.log('\n[Global Setup] Syncing test DB schemas...');

  execSync('npx prisma db push --accept-data-loss', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: 'inherit',
  });

  console.log('[Global Setup] DB ready for the tests\n');
}
