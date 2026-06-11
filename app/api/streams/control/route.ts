import { NextRequest, NextResponse } from "next/server";
import { getStreamByStreamId, updateStreamConfig } from "@/lib/server/payroll-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employerWallet, streamId, action } = body;

    const stream = await getStreamByStreamId(streamId);
    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    const nextStatus = action === "pause" ? "paused" : action === "resume" ? "active" : "stopped";

    return NextResponse.json({
      ok: true,
      nextStatus,
      transactions: {
        control: {
          transactionBase64: "mock-tx-base64",
          sendTo: "ephemeral",
        },
      },
      employeePda: stream.employeePda || "0xMockEmployeePda",
      privatePayrollPda: stream.privatePayrollPda || "0xMockPrivatePayrollPda",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { employerWallet, streamId, action, ratePerSecond } = body;

    const nextStatus = action === "pause" ? "paused" : action === "resume" ? "active" : "stopped";

    const stream = await updateStreamConfig({
      employerWallet,
      streamId,
      status: nextStatus,
      ratePerSecond,
    });

    return NextResponse.json({
      ok: true,
      stream,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
