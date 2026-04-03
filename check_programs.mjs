import { db } from './lib/db/index.js';

async function check() {
  try {
    const progs = await db.list('academic_programs');
    console.log('Programs:', JSON.stringify(progs, null, 2));
  } catch (e) {
    console.error(e);
  }
}

check();
