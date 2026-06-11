import { NextRequest, NextResponse } from "next/server";
import { loadCompanyPrivateKey } from "@/lib/server/company-key-vault";
import {
  CompanyRouteAuthError,
  requireCompanyOwnerRequest,
} from "@/lib/server/company-route-auth";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await context.params;

  try {
    await requireCompanyOwnerRequest({
      request,
      companyId,
    });

    // Load the treasury private key from the encrypted vault to confirm it exists
    await loadCompanyPrivateKey({
      companyId,
      kind: "treasury",
    });

    return NextResponse.json({
      ok: true,
      balance: "1000000000", // Mock balance (1000.00 USDC in 6 decimals)
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
