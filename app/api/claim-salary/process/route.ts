import { NextRequest, NextResponse } from "next/server";
import { getStreamById } from "@/lib/server/payroll-store";
import { getMongoDb } from "@/lib/server/mongodb";
import { loadCompanyPrivateKey } from "@/lib/server/company-key-vault";
import { createPublicClient, http, createWalletClient } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { optionalEnv } from "@/lib/server/company-env";
import { PAYROLL_CONTRACT_ADDRESS, USDC_ADDRESS, RIAD_FINANCE_PAYROLL_ABI } from "@/lib/client/contract-config";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody || "{}");
    const streamId = body.streamId?.trim();
    const employeeWallet = body.employeeWallet?.trim();
    const amountMicro = body.amountMicro;

    if (!streamId || !employeeWallet || !amountMicro) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getMongoDb();
    const stream = await db.collection("streams").findOne({ id: streamId });
    
    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    const employerWallet = stream.employerWallet;

    // Find company to get its ID (case insensitive because streams might use checksummed address)
    const company = await db.collection("companies").findOne({ 
      employerWallet: { $regex: new RegExp(`^${employerWallet}$`, 'i') } 
    });
    let companyId = company?.id;
    
    if (!companyId) {
      // Fallback: the employer document might have it
      const employer = await db.collection("employers").findOne({ 
        wallet: { $regex: new RegExp(`^${employerWallet}$`, 'i') } 
      });
      companyId = employer?.id;
    }
    
    // If no company found, we might still be able to find the treasury key if company_keys uses employerWallet
    // Let's get the private key directly if possible
    let privateKey;
    try {
      privateKey = await loadCompanyPrivateKey({ companyId: companyId || employerWallet, kind: "treasury" });
    } catch (e) {
      return NextResponse.json({ error: "Company treasury not configured" }, { status: 400 });
    }

    const rpcUrl = optionalEnv("ARBITRUM_SEPOLIA_RPC_URL", "https://sepolia-rollup.arbitrum.io/rpc");
    const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(rpcUrl) });
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({ account, chain: arbitrumSepolia, transport: http(rpcUrl) });

    const recipientAddresses = [employeeWallet as `0x${string}`];
    const amountsMicro = [BigInt(amountMicro)];

    const { request: txRequest } = await publicClient.simulateContract({
      address: PAYROLL_CONTRACT_ADDRESS,
      abi: RIAD_FINANCE_PAYROLL_ABI,
      functionName: "teeTransfer",
      args: [employerWallet as `0x${string}`, USDC_ADDRESS, recipientAddresses, amountsMicro],
      account,
    });
    
    const paymentTxSignature = await walletClient.writeContract(txRequest);

    // Update stream's total paid in MongoDB
    await db.collection("streams").updateOne(
      { id: streamId },
      { 
        $inc: { totalPaid: amountMicro / 1_000_000 },
        $set: { lastPaidAt: new Date().toISOString() }
      }
    );

    return NextResponse.json({
      claim: {
        paymentTxSignature,
        markPaidTxSignature: paymentTxSignature
      }
    });
  } catch (error: any) {
    console.error("Failed to process claim:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
