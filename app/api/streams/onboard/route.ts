import { NextRequest, NextResponse } from "next/server";
import { getStreamByStreamId, updateStreamRuntimeState } from "@/lib/server/payroll-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employerWallet, streamId, employeePda, privatePayrollPda, permissionPda } = body;

    const stream = await getStreamByStreamId(streamId);
    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Update runtime state with provided parameters or fallbacks
    await updateStreamRuntimeState({
      employerWallet,
      streamId,
      employeePda: employeePda || "0xMockEmployeePda",
      privatePayrollPda: privatePayrollPda || "0xMockPrivatePayrollPda",
      permissionPda: permissionPda || "0xMockPermissionPda",
      delegatedAt: new Date().toISOString(),
      recipientPrivateInitializedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      message: "Stream onboarded successfully",
      employeePda: employeePda || "0xMockEmployeePda",
      privatePayrollPda: privatePayrollPda || "0xMockPrivatePayrollPda",
      permissionPda: permissionPda || "0xMockPermissionPda",
      transactions: {},
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { employerWallet, streamId, employeePda, privatePayrollPda, permissionPda } = body;

    const stream = await updateStreamRuntimeState({
      employerWallet,
      streamId,
      employeePda,
      privatePayrollPda: privatePayrollPda || "0xMockPrivatePayrollPda",
      permissionPda: permissionPda || "0xMockPermissionPda",
      delegatedAt: new Date().toISOString(),
      recipientPrivateInitializedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      stream,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
