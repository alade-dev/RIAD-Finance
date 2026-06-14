import { NextRequest, NextResponse } from "next/server";
import { getStreamById, getEmployeeById } from "@/lib/server/payroll-store";

export async function GET(request: NextRequest) {
  const employerWallet = request.nextUrl.searchParams.get("employerWallet")?.trim();
  const streamId = request.nextUrl.searchParams.get("streamId")?.trim();

  if (!employerWallet || !streamId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const stream = await getStreamById(employerWallet, streamId);
    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    const employee = await getEmployeeById(employerWallet, stream.employeeId);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const nowMs = Date.now();
    const startsAtMs = stream.startsAt ? new Date(stream.startsAt).getTime() : nowMs;
    const lastAccrualTs = stream.lastPaidAt ? new Date(stream.lastPaidAt).getTime() : startsAtMs;
    // Prevent negative accrual if startsAt is in the future
    const effectiveNowMs = Math.max(nowMs, lastAccrualTs);
    const accrued = Math.floor((effectiveNowMs - lastAccrualTs) / 1000 * stream.ratePerSecond * 1_000_000);
    const totalPaidPrivateMicro = Math.floor((stream.totalPaid ?? 0) * 1_000_000).toString();

    return NextResponse.json({
      employerWallet,
      streamId,
      employee: {
        id: employee.id,
        wallet: employee.wallet,
        name: employee.name,
      },
      stream: {
        id: stream.id,
        status: stream.status,
        ratePerSecond: stream.ratePerSecond,
        employeePda: stream.employeePda ?? null,
        privatePayrollPda: stream.privatePayrollPda ?? null,
        permissionPda: stream.permissionPda ?? null,
        delegatedAt: stream.delegatedAt ?? null,
        checkpointCrankStatus: "active",
        checkpointCrankUpdatedAt: new Date().toISOString(),
        lastPaidAt: stream.lastPaidAt ?? null,
        totalPaid: stream.totalPaid ?? 0,
      },
      state: {
        employeePda: stream.employeePda ?? "mock-pda",
        privatePayrollPda: stream.privatePayrollPda ?? "mock-pda",
        employee: employee.wallet,
        streamId: stream.id,
        status: stream.status,
        version: "2",
        lastCheckpointTs: (nowMs / 1000).toString(),
        ratePerSecondMicro: Math.floor(stream.ratePerSecond * 1_000_000).toString(),
        lastAccrualTimestamp: (nowMs / 1000).toString(),
        accruedUnpaidMicro: accrued.toString(),
        rawClaimableAmountMicro: accrued.toString(),
        pendingAccrualMicro: "0",
        totalPaidPrivateMicro,
        effectiveClaimableAmountMicro: accrued.toString(),
        monthlyCapUsd: null,
        monthlyCapMicro: null,
        cycleKey: null,
        cycleStart: null,
        cycleEnd: null,
        paidThisCycleMicro: null,
        remainingCapMicro: null,
        capReached: false,
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Failed to fetch state:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
