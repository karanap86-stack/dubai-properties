// config/db.js
// MongoDB connection utility for serviceProviderService and other services
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate';
let client = null;
let db = null;

export default async function getDb() {
  if (db) return db;
  if (!client) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
  }
  db = client.db();
  return db;
}
