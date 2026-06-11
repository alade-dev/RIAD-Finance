import { NextRequest, NextResponse } from "next/server";
import { getStreamByStreamId, updateStreamConfig } from "@/lib/server/payroll-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employerWallet, streamId } = body;

    const stream = await getStreamByStreamId(streamId);
    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      transactions: {
        restart: {
          transactionBase64: "mock-tx-base64",
          sendTo: "ephemeral",
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { employerWallet, streamId } = body;

    const stream = await updateStreamConfig({
      employerWallet,
      streamId,
      status: "active",
    });

    return NextResponse.json({
      ok: true,
      stream,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
