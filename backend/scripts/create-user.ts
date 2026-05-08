/**
 * 사용자 생성 스크립트
 * 사용: npx tsx scripts/create-user.ts <name> <password>
 * 예시: npx tsx scripts/create-user.ts eddy mypassword
 */
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcrypt';
import { resolve } from 'path';

const [, , name, password] = process.argv;

if (!name || !password) {
  console.error('사용법: npx tsx scripts/create-user.ts <name> <password>');
  process.exit(1);
}

async function run() {
  const dbPath = resolve(process.cwd(), process.env.DB_SQLITE_PATH || './data/mk2.db');
  const db = new DatabaseSync(dbPath);

  const hashed = await bcrypt.hash(password, 10);
  db.prepare('INSERT INTO user (name, password) VALUES (?, ?)').run(name, hashed);

  console.log(`사용자 "${name}" 생성 완료`);
  db.close();
}

run();
