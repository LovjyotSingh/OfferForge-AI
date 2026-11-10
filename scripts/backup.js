#!/usr/bin/env node
// Dumps every collection in the database to a single JSON file (Extended JSON,
// so ObjectIds and dates survive a restore).
// Usage: MONGODB_URI=... node scripts/backup.js <output.json>
const fs = require('fs');
const path = require('path');
const { MongoClient, BSON } = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mongodb'));
const { EJSON } = BSON;

// Short-lived counters; not worth backing up.
const SKIP = new Set(['ratelimits']);

async function main() {
  const out = process.argv[2];
  if (!process.env.MONGODB_URI || !out) {
    console.error('Usage: MONGODB_URI=... node scripts/backup.js <output.json>');
    process.exit(2);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  try {
    const db = client.db();
    const collections = (await db.listCollections({}, { nameOnly: true }).toArray())
      .map(c => c.name)
      .filter(name => !SKIP.has(name) && !name.startsWith('system.'));

    const dump = { createdAt: new Date().toISOString(), database: db.databaseName, collections: {} };
    for (const name of collections) {
      dump.collections[name] = await db.collection(name).find({}).toArray();
      console.log(`${name}: ${dump.collections[name].length} documents`);
    }
    fs.writeFileSync(out, EJSON.stringify(dump, { relaxed: false }));
    console.log(`Backup written (${collections.length} collections).`);
  } finally {
    await client.close();
  }
}

main().catch(err => {
  // Print only the message: the error could otherwise include the connection string.
  console.error('Backup failed:', err.message.replace(/mongodb(\+srv)?:\/\/[^\s]+/g, '[redacted]'));
  process.exit(1);
});
