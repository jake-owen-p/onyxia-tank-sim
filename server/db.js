import { PrismaClient } from './generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'node:fs';

const ca = readFileSync(new URL('./certs/supabase-ca.crt', import.meta.url), 'utf8');

let db;
export function database() {
  if (!process.env.DATABASE_URL) throw new Error('Cloud saves are not configured');
  db ||= new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true, ca }, max: 3, connectionTimeoutMillis: 10000, idleTimeoutMillis: 20000 }) });
  return db;
}
