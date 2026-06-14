import { NextRequest, NextResponse } from "next/server";
import { loadCompanyPrivateKey } from "@/lib/server/company-key-vault";
import {
  CompanyRouteAuthError,
  requireCompanyOwnerRequest,
} from "@/lib/server/company-route-auth";
import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await context.params;

  try {
    const { company } = await requireCompanyOwnerRequest({
      request,
      companyId,
    });

    if (!company) {
      return NextResponse.json({ ok: false, error: "Company not found" }, { status: 404 });
    }

    // Load the treasury private key from the encrypted vault to confirm it exists
    await loadCompanyPrivateKey({
      companyId,
      kind: "treasury",
    });

    const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
    const publicClient = createPublicClient({
      chain: arbitrumSepolia,
      transport: http(rpcUrl),
    });

    const PAYROLL_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS || "0xD61f56213E17F131DC0A34AB16C982742C56586b";
    const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

    // ABI snippet for treasuryBalances
    const abi = [
      {
        type: "function",
        name: "treasuryBalances",
        inputs: [
          { name: "", type: "address", internalType: "address" },
          { name: "", type: "address", internalType: "address" }
        ],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view"
      }
    ] as const;

    let balance = "0";
    if (company.employerWallet) {
      try {
        const result = await publicClient.readContract({
          address: PAYROLL_CONTRACT_ADDRESS as `0x${string}`,
          abi,
          functionName: "treasuryBalances",
          args: [company.employerWallet as `0x${string}`, USDC_ADDRESS as `0x${string}`],
        });
        balance = result.toString();
      } catch (err) {
        console.error("Failed to read on-chain balance:", err);
      }
    }

    return NextResponse.json({
      ok: true,
      balance,
      location: "ephemeral",
    });
  } catch (error) {
    if (error instanceof CompanyRouteAuthError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to fetch treasury balance.",
      },
      { status: 500 }
    );
  }
}
