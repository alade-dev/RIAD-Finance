import crypto from "node:crypto";
import { Collection } from "mongodb";
import { requiredEnv } from "./company-env";
import { getMongoDb } from "./mongodb";
import type { EncryptedCompanyKey } from "./company-types";

// ── MongoDB collection ──

async function keysCollection(): Promise<Collection<EncryptedCompanyKey>> {
  const db = await getMongoDb();
  return db.collection<EncryptedCompanyKey>("company_keys");
}

// ── Encryption helpers ──

function encryptionKey(): Buffer {
  const secret = requiredEnv("COMPANY_KEY_ENCRYPTION_SECRET");

  if (secret.length < 32) {
    throw new Error("COMPANY_KEY_ENCRYPTION_SECRET must be at least 32 characters.");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function encryptSecretKey(secretKey: string): {
  encryptedSecretKeyBase64: string;
  ivBase64: string;
  authTagBase64: string;
} {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(secretKey, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    encryptedSecretKeyBase64: encrypted.toString("base64"),
    ivBase64: iv.toString("base64"),
    authTagBase64: authTag.toString("base64"),
  };
}

function decryptSecretKey(record: EncryptedCompanyKey): string {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(record.ivBase64, "base64")
  );

  decipher.setAuthTag(Buffer.from(record.authTagBase64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(record.encryptedSecretKeyBase64, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// ── Public API ──

export async function saveCompanyPrivateKey(args: {
  companyId: string;
  kind: "treasury" | "settlement";
  privateKey: string;
  address: string;
}): Promise<EncryptedCompanyKey> {
  const collection = await keysCollection();

  const existing = await collection.findOne({
    companyId: args.companyId,
    kind: args.kind,
  });

  if (existing) {
    throw new Error(`PrivateKey already exists for company=${args.companyId}, kind=${args.kind}`);
  }

  const encrypted = encryptSecretKey(args.privateKey);

  const record: EncryptedCompanyKey = {
    id: crypto.randomUUID(),
    companyId: args.companyId,
    kind: args.kind,
    pubkey: args.address,
    ...encrypted,
    createdAt: new Date().toISOString(),
  };

  await collection.insertOne(record);

  return record;
}

export async function loadCompanyPrivateKey(args: {
  companyId: string;
  kind: "treasury" | "settlement";
}): Promise<string> {
  const collection = await keysCollection();

  const record = await collection.findOne({
    companyId: args.companyId,
    kind: args.kind,
  });

  if (!record) {
    throw new Error(`Missing ${args.kind} privateKey for company ${args.companyId}`);
  }

  return decryptSecretKey(record);
}

export async function getCompanyKeyPublicInfo(args: {
  companyId: string;
  kind: "treasury" | "settlement";
}): Promise<Pick<EncryptedCompanyKey, "companyId" | "kind" | "pubkey" | "createdAt" | "id"> | null> {
  const collection = await keysCollection();

  const record = await collection.findOne({
    companyId: args.companyId,
    kind: args.kind,
  });

  if (!record) return null;

  return {
    id: record.id,
    companyId: record.companyId,
    kind: record.kind,
    pubkey: record.pubkey,
    createdAt: record.createdAt,
  };
}
