// starlink-backend/db.js
const { MongoClient } = require('mongodb');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/starlink';
const DB_NAME = 'starlink';

let client;
let db;

async function connectDB() {
  if (!client) {
    client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
    await client.connect();
    db = client.db(DB_NAME);
  }
  return db;
}

async function saveTelemetry(accountNumber, telemetry) {
  const database = await connectDB();
  const collection = database.collection('telemetry');
  await collection.insertOne({ accountNumber, telemetry, timestamp: new Date() });
}

async function getTelemetry(accountNumber) {
  const database = await connectDB();
  const collection = database.collection('telemetry');
  return await collection.find({ accountNumber }).sort({ timestamp: -1 }).limit(100).toArray();
}

module.exports = { connectDB, saveTelemetry, getTelemetry };
