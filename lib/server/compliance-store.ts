import { randomUUID } from "crypto";
import { type Collection, type Db } from "mongodb";
import { getMongoDb } from "./mongodb";

export interface ComplianceEvent {
  id: string;
  date: string;
  actorWallet: string;
  action: string;
  route: string;
  subjectWallet?: string;
  resourceType: string;
  resourceId?: string;
  status: "success" | "failed";
  metadata?: Record<string, string | number | boolean | null>;
}

type ComplianceEventDoc = ComplianceEvent;

function normalizeWallet(wallet: string) {
  return wallet.trim();
}

function assertWallet(wallet: string, fieldName = "wallet") {
  const value = normalizeWallet(wallet);
  if (value.length < 32) {
    throw new Error(`${fieldName} must be a valid wallet address`);
  }
  return value;
}

function nowIso() {
  return new Date().toISOString();
}

async function getDb(): Promise<Db> {
  return getMongoDb();
}

async function complianceEventsCollection(): Promise<
  Collection<ComplianceEventDoc>
> {
  return (await getDb()).collection<ComplianceEventDoc>("compliance_events");
}

export async function saveComplianceEvent(
  event: Omit<ComplianceEvent, "id" | "date">,
) {
  const record: ComplianceEvent = {
    ...event,
    actorWallet: assertWallet(event.actorWallet, "actorWallet"),
    subjectWallet: event.subjectWallet
      ? assertWallet(event.subjectWallet, "subjectWallet")
      : undefined,
    id: randomUUID(),
    date: nowIso(),
  };

  await (await complianceEventsCollection()).insertOne(record);
  return record;
}

export async function listComplianceEventsForWallet(wallet: string) {
  const normalizedWallet = assertWallet(wallet);
  return (await complianceEventsCollection())
    .find({
      $or: [
        { actorWallet: normalizedWallet },
        { subjectWallet: normalizedWallet },
      ],
    })
    .sort({ date: -1 })
    .toArray();
}
