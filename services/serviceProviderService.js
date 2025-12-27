
// serviceProviderService.js
// Manages 3rd-party service providers (interior, loan, rental, resale, etc.)
// Commission model support, aggregation, and search

import { ObjectId } from 'mongodb';
import getDb from '../config/db';

const COLLECTION = 'service_providers';

// Get all providers, with optional filters (type, region, status)
export async function getAllProviders(filter = {}) {
  const db = await getDb();
  return db.collection(COLLECTION).find(filter).toArray();
}

// Add a new provider
export async function addProvider(provider) {
  const db = await getDb();
  const doc = {
    ...provider,
    createdAt: new Date(),
    updatedAt: new Date(),
    status: provider.status || 'active',
    commissionModel: provider.commissionModel || { type: 'fixed', value: 0 },
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { success: true, id: result.insertedId };
}

// Update provider by ID
export async function updateProvider(id, updates) {
  const db = await getDb();
  const result = await db.collection(COLLECTION).updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  if (result.matchedCount === 0) throw new Error('Provider not found');
  return { success: true };
}

// Remove provider by ID
export async function removeProvider(id) {
  const db = await getDb();
  const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) throw new Error('Provider not found');
  return { success: true };
}

// Aggregate providers by type, region, or status
export async function aggregateProviders(groupBy = 'type') {
  const db = await getDb();
  const pipeline = [
    { $group: { _id: `$${groupBy}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ];
  return db.collection(COLLECTION).aggregate(pipeline).toArray();
}

// Search providers by name, type, or region
export async function searchProviders(query) {
  const db = await getDb();
  const filter = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { type: { $regex: query, $options: 'i' } },
      { region: { $regex: query, $options: 'i' } }
    ]
  };
  return db.collection(COLLECTION).find(filter).toArray();
}

export default {
  getAllProviders,
  addProvider,
  updateProvider,
  removeProvider,
  aggregateProviders,
  searchProviders,
};
