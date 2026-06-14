import { NextRequest, NextResponse } from "next/server";
import { listEmployeesByWallet } from "@/lib/server/payroll-store";

import { getMongoDb } from "@/lib/server/mongodb";

export async function GET(request: NextRequest) {
  const employeeWallet = request.nextUrl.searchParams.get("employeeWallet")?.trim();
  if (!employeeWallet) {
    return NextResponse.json({ error: "Missing employeeWallet" }, { status: 400 });
  }

  try {
    const employees = await listEmployeesByWallet(employeeWallet);
    const employeeIds = employees.map(e => e.id);
    
    const db = await getMongoDb();
    const streamsDb = await db.collection("streams").find({ employeeId: { $in: employeeIds } }).toArray();

    const streams = streamsDb.map(stream => {
      const employee = employees.find(e => e.id === stream.employeeId);
      if (!employee) return null;
      
      const nowMs = Date.now();
      const startsAtMs = stream.startsAt ? new Date(stream.startsAt).getTime() : nowMs;
      const lastAccrualTs = stream.lastPaidAt ? new Date(stream.lastPaidAt).getTime() : startsAtMs;
      // Prevent negative accrual if startsAt is in the future
      const effectiveNowMs = Math.max(nowMs, lastAccrualTs);
      const accrued = Math.floor((effectiveNowMs - lastAccrualTs) / 1000 * stream.ratePerSecond * 1_000_000);
      
      return {
        employerWallet: stream.employerWallet,
        employee: {
          id: employee.id,
          wallet: employee.wallet,
          name: employee.name,
          privateRecipientInitializedAt: employee.privateRecipientInitializedAt,
        },
        stream: {
          id: stream.id,
          status: stream.status,
          ratePerSecond: stream.ratePerSecond,
          payoutMode: stream.payoutMode ?? "base",
          allowedPayoutModes: stream.allowedPayoutModes ?? ["base"],
          employeePda: stream.employeePda ?? null,
          privatePayrollPda: stream.privatePayrollPda ?? null,
          permissionPda: stream.permissionPda ?? null,
          delegatedAt: stream.delegatedAt ?? null,
          recipientPrivateInitializedAt: stream.recipientPrivateInitializedAt ?? null,
          lastPaidAt: stream.lastPaidAt ?? null,
          totalPaid: stream.totalPaid ?? 0,
          checkpointCrankStatus: "active",
          checkpointCrankUpdatedAt: new Date().toISOString(),
          updatedAt: stream.updatedAt,
        },
        liveState: {
          ready: true,
          source: "per-snapshot",
          reason: "snapshot-available"
        },
        snapshot: {
          employeePda: stream.employeePda ?? "mock-pda",
          privatePayrollPda: stream.privatePayrollPda ?? "mock-pda",
          employee: employee.wallet,
          streamId: stream.id,
          teeObservedAt: new Date().toISOString(),
          status: stream.status,
          version: "2",
          lastCheckpointTs: (nowMs / 1000).toString(),
          ratePerSecondMicro: Math.floor(stream.ratePerSecond * 1_000_000).toString(),
          lastAccrualTimestamp: (nowMs / 1000).toString(),
          accruedUnpaidMicro: accrued.toString(),
          totalPaidPrivateMicro: Math.floor((stream.totalPaid ?? 0) * 1_000_000).toString(),
          pendingAccrualMicro: "0",
          rawClaimableAmountMicro: accrued.toString(),
          effectiveClaimableAmountMicro: accrued.toString(),
          monthlyCapUsd: null,
          monthlyCapMicro: null,
          cycleKey: null,
          cycleStart: null,
          cycleEnd: null,
          paidThisCycleMicro: null,
          remainingCapMicro: null,
          capReached: false
        }
      };
    }).filter(Boolean);

    return NextResponse.json({
      employeeWallet,
      employees: employees.map((e) => ({
        id: e.id,
        employerWallet: e.employerWallet,
        name: e.name,
        payrollMode: e.payrollMode ?? "streaming",
        privateRecipientInitializedAt: e.privateRecipientInitializedAt,
      })),
      streams,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
