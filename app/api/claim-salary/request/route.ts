import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ pendingClaim: null });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    transactions: {
      requestWithdrawal: { transactionBase64: "mock-tx-base64" }
    },
    claimId: "mock-claim-123"
  });
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json({ success: true });
}
