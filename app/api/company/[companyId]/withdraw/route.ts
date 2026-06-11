import { NextRequest, NextResponse } from "next/server";
import { loadCompanyPrivateKey } from "@/lib/server/company-key-vault";
import {
  CompanyRouteAuthError,
  requireCompanyOwnerRequest,
} from "@/lib/server/company-route-auth";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await context.params;

  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody || "{}");

    if (!body.amount || typeof body.amount !== "number") {
      return NextResponse.json({ ok: false, error: "Invalid amount" }, { status: 400 });
    }
    if (!body.destinationAddress) {
      return NextResponse.json({ ok: false, error: "Missing destinationAddress" }, { status: 400 });
    }

    await requireCompanyOwnerRequest({
      request,
      companyId,
      body: rawBody,
    });

    // Load the treasury private key from the encrypted vault to verify it exists
    await loadCompanyPrivateKey({
      companyId,
      kind: "treasury",
    });

    return NextResponse.json({
      ok: true,
      signature: "0xmockwithdrawtxsignature",
      amount: body.amount,
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
        error: error instanceof Error ? error.message : "Failed to withdraw from treasury.",
      },
      { status: 500 }
    );
  }
}
