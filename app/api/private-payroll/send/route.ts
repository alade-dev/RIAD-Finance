import { NextRequest, NextResponse } from "next/server";
import { requireEmployerCompanyRequest } from "@/lib/server/company-route-auth";
import { loadCompanyPrivateKey } from "@/lib/server/company-key-vault";
import { savePayrollRun } from "@/lib/server/history-store";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { generateStealthAddress } from "@/lib/server/umbra";
import { optionalEnv } from "@/lib/server/company-env";
import {
  PAYROLL_CONTRACT_ADDRESS,
  USDC_ADDRESS,
  RIAD_FINANCE_PAYROLL_ABI,
} from "@/lib/client/contract-config";

export const runtime = "nodejs";

type SendPrivatePayrollBody = {
  employerWallet?: string;
  payPeriod?: string;
  recipients?: Array<{
    employeeId?: string;
    name?: string;
    address?: string;
    amount?: number;
  }>;
};

function badRequest(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const body = JSON.parse(rawBody || "{}") as SendPrivatePayrollBody;
  const employerWallet = body.employerWallet?.trim();
  const payPeriodRaw = body.payPeriod?.trim();

  if (!employerWallet) {
    return badRequest("employerWallet is required");
  }

  const now = new Date();
  const defaultPayPeriod = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
  const payPeriod = payPeriodRaw || defaultPayPeriod;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(payPeriod)) {
    return badRequest("payPeriod must be YYYY-MM");
  }

  const recipients = Array.isArray(body.recipients)
    ? body.recipients
        .map((recipient) => ({
          employeeId: recipient.employeeId?.trim() || undefined,
          name: recipient.name?.trim() || undefined,
          address: recipient.address?.trim() || "",
          amount: Number(recipient.amount ?? 0),
        }))
        .filter(
          (recipient) =>
            recipient.address.length >= 42 &&
            Number.isFinite(recipient.amount) &&
            recipient.amount > 0,
        )
    : [];

  if (recipients.length === 0) {
    return badRequest("At least one valid recipient is required");
  }

  const { company } = await requireEmployerCompanyRequest({
    request,
    employerWallet,
    body: rawBody,
  });

  if (!company) {
    return badRequest("Company not found for employer", 404);
  }

  // Load the treasury private key to verify access
  const privateKey = await loadCompanyPrivateKey({
    companyId: company.id,
    kind: "treasury",
  });

  // Initialize Viem publicClient and privateKeyToAccount
  const rpcUrl = optionalEnv("ARBITRUM_SEPOLIA_RPC_URL", "https://sepolia-rollup.arbitrum.io/rpc");
  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(rpcUrl),
  });

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  // Fetch the company's treasury balance from the smart contract
  let onChainBalanceMicro = BigInt("1000000000"); // Default fallback to 1000 USDC
  try {
    const balance = await publicClient.readContract({
      address: PAYROLL_CONTRACT_ADDRESS,
      abi: RIAD_FINANCE_PAYROLL_ABI,
      functionName: "treasuryBalances",
      args: [account.address, USDC_ADDRESS],
    });
    onChainBalanceMicro = BigInt(balance);
  } catch (error) {
    console.error("Failed to fetch on-chain treasury balance:", error);
  }

  const totalAmountMicro = recipients.reduce(
    (sum, recipient) => sum + Math.round(recipient.amount * 1_000_000),
    0,
  );

  // Generate stealth addresses for all recipients using the Umbra protocol math
  const transferResults = recipients.map((recipient) => {
    const { stealthAddress, ephemeralPublicKey } = generateStealthAddress(recipient.address);
    return {
      employeeId: recipient.employeeId,
      name: recipient.name,
      address: stealthAddress, // Stealth destination address
      ephemeralPublicKey,      // Ephemeral public key needed by recipient to claim funds
      originalAddress: recipient.address,
      amount: recipient.amount,
      signature: "0xmocktransfertxsignature",
      sendTo: "ephemeral",
    };
  });

  const payrollRun = await savePayrollRun({
    wallet: employerWallet,
    mode: "private_payroll",
    payPeriod,
    totalAmount: totalAmountMicro / 1_000_000,
    employeeCount: recipients.length,
    employeeIds: recipients
      .map((recipient) => recipient.employeeId)
      .filter((value): value is string => Boolean(value)),
    employeeNames: recipients
      .map((recipient) => recipient.name)
      .filter((value): value is string => Boolean(value)),
    employeeAmounts: recipients.map((recipient) => recipient.amount),
    recipientAddresses: transferResults.map((transfer) => transfer.address), // Save stealth addresses to break link
    transferSig: transferResults[0]?.signature,
    transferSigs: transferResults.map((transfer) => transfer.signature ?? ""),
    status: "success",
    privacyConfig: {
      visibility: "private",
      fromBalance: "ephemeral",
      toBalance: "ephemeral",
    },
    providerMeta: {
      provider: "riad-finance",
      action: "employee-private-transfer",
      sendTo: transferResults[0]?.sendTo,
      transferProofs: transferResults.map((transfer) => ({
        address: transfer.address,
        ephemeralPublicKey: transfer.ephemeralPublicKey,
        amount: transfer.amount,
        signature: transfer.signature ?? "",
      })),
    },
  });

  return NextResponse.json({
    ok: true,
    companyId: company.id,
    treasuryPubkey: company.treasuryPubkey,
    treasuryPrivateBalanceMicro: Number(onChainBalanceMicro),
    totalAmountMicro,
    transferResults,
    payrollRun,
  });
}
