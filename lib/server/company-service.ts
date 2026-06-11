import crypto from "node:crypto";
import { z } from "zod";
import { boolEnv } from "./company-env";
import {
  createCompanyRecord,
  findCompanyByEmployerWallet,
  findCompanyById,
} from "./company-store";
import { saveCompanyPrivateKey } from "./company-key-vault";
import type { Company, CreateCompanyInput, PublicCompanyResponse } from "./company-types";
import { verifyMessage } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

// ── Zod schema ──

const createCompanySchema = z.object({
  name: z.string().min(2).max(80),
  employerWallet: z.string().min(42),
  message: z.string().optional(),
  signature: z.string().optional(),
});

// ── Wallet auth helpers ──

function expectedCreateCompanyMessage(args: {
  employerWallet: string;
  companyName: string;
}): string {
  return [
    "Create RIAD Financee payroll company",
    `Company: ${args.companyName}`,
    `Employer: ${args.employerWallet}`,
  ].join("\n");
}

async function verifyWalletSignature(args: {
  wallet: string;
  message: string;
  signature: string;
}): Promise<boolean> {
  try {
    return await verifyMessage({
      address: args.wallet as `0x${string}`,
      message: args.message,
      signature: args.signature as `0x${string}`,
    });
  } catch {
    return false;
  }
}

// ── Helpers ──

function toPublicCompany(company: Company): PublicCompanyResponse {
  return {
    id: company.id,
    name: company.name,
    employerWallet: company.employerWallet,
    treasuryPubkey: company.treasuryPubkey,
    settlementPubkey: company.settlementPubkey,
    currency: company.currency,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

// ── Public API ──

export async function getCompanyForEmployer(employerWallet: string): Promise<PublicCompanyResponse | null> {
  const company = await findCompanyByEmployerWallet(employerWallet.toLowerCase());
  return company ? toPublicCompany(company) : null;
}

export async function getCompany(companyId: string): Promise<PublicCompanyResponse | null> {
  const company = await findCompanyById(companyId);
  return company ? toPublicCompany(company) : null;
}

export async function createCompany(input: CreateCompanyInput): Promise<PublicCompanyResponse> {
  const parsed = createCompanySchema.parse(input);

  const employerWallet = parsed.employerWallet.toLowerCase();

  // Idempotent: return existing company if already created
  const existing = await findCompanyByEmployerWallet(employerWallet);
  if (existing) {
    return toPublicCompany(existing);
  }

  // Optional wallet signature verification (production only)
  if (boolEnv("ENFORCE_WALLET_SIGNATURE", false)) {
    if (!parsed.message || !parsed.signature) {
      throw new Error("Wallet signature is required.");
    }

    const expected = expectedCreateCompanyMessage({
      employerWallet,
      companyName: parsed.name,
    });

    if (parsed.message !== expected) {
      throw new Error("Invalid signed message.");
    }

    const ok = await verifyWalletSignature({
      wallet: employerWallet,
      message: parsed.message,
      signature: parsed.signature,
    });

    if (!ok) {
      throw new Error("Invalid wallet signature.");
    }
  }

  // Generate private keys
  const treasuryPrivateKey = generatePrivateKey();
  const settlementPrivateKey = generatePrivateKey();
  const treasuryAccount = privateKeyToAccount(treasuryPrivateKey);
  const settlementAccount = privateKeyToAccount(settlementPrivateKey);

  const now = new Date().toISOString();
  const companyId = crypto.randomUUID();

  const company: Company = {
    id: companyId,
    name: parsed.name.trim(),
    employerWallet,
    treasuryPubkey: treasuryAccount.address,
    settlementPubkey: settlementAccount.address,
    currency: "USDC",
    createdAt: now,
    updatedAt: now,
  };

  // Encrypt and store keys
  await saveCompanyPrivateKey({
    companyId,
    kind: "treasury",
    privateKey: treasuryPrivateKey,
    address: treasuryAccount.address,
  });

  await saveCompanyPrivateKey({
    companyId,
    kind: "settlement",
    privateKey: settlementPrivateKey,
    address: settlementAccount.address,
  });

  // Store company record
  await createCompanyRecord(company);

  return toPublicCompany(company);
}
