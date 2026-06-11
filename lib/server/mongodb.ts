import { MongoClient, Db } from "mongodb";

const MONGODB_DB = process.env.MONGODB_DB || "riadfinance";

type GlobalMongoCache = {
  clientPromise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as typeof globalThis & {
  __mongo?: GlobalMongoCache;
};

const mongoCache = globalForMongo.__mongo ?? {};

if (!globalForMongo.__mongo) {
  globalForMongo.__mongo = mongoCache;
}

function createClientPromise() {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }
  const client = new MongoClient(mongodbUri);
  return client.connect();
}

export function getMongoClient(): Promise<MongoClient> {
  if (!mongoCache.clientPromise) {
    mongoCache.clientPromise = createClientPromise();
  }

  return mongoCache.clientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(MONGODB_DB);
}
