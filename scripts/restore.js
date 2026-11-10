#!/usr/bin/env node
// Restores a backup made by scripts/backup.js.
// Usage: MONGODB_URI=... node scripts/restore.js <backup.json> [--replace]
//   Without --replace, it refuses to touch collections that already have data.
const fs = require('fs');
const path = require('path');
const { MongoClient, BSON } = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mongodb'));
const { EJSON } = BSON;

async function main() {
  const file = process.argv[2];
  const replace = process.argv.includes('--replace');
  if (!process.env.MONGODB_URI || !file) {
    console.error('Usage: MONGODB_URI=... node scripts/restore.js <backup.json> [--replace]');
    process.exit(2);
  }

  const dump = EJSON.parse(fs.readFileSync(file, 'utf8'), { relaxed: false });
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  try {
    const db = client.db();
    for (const [name, docs] of Object.entries(dump.collections)) {
      const collection = db.collection(name);
      const existing = await collection.estimatedDocumentCount();
      if (existing > 0 && !replace) {
        console.error(`${name} already has ${existing} documents. Re-run with --replace to overwrite it.`);
        process.exit(1);
      }
      if (replace) await collection.deleteMany({});
      if (docs.length) await collection.insertMany(docs);
      console.log(`${name}: restored ${docs.length} documents`);
    }
    console.log(`Restored backup from ${dump.createdAt}.`);
  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error('Restore failed:', err.message.replace(/mongodb(\+srv)?:\/\/[^\s]+/g, '[redacted]'));
  process.exit(1);
});
