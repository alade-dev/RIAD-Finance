import { NextRequest, NextResponse } from "next/server";
import { listEmployeePayrollRuns, listClaimRecords } from "@/lib/server/history-store";

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet")?.trim();
  if (!wallet) return NextResponse.json({ error: "Missing wallet" }, { status: 400 });

  try {
    // 1. Get all payrolls sent to this employee
    const payrollRuns = await listEmployeePayrollRuns(wallet);
    let totalReceived = 0;
    for (const run of payrollRuns) {
      if (run.status === "success" && run.providerMeta?.transferProofs) {
        for (const proof of run.providerMeta.transferProofs) {
          if ((proof as any).originalAddress?.toLowerCase() === wallet.toLowerCase()) {
            totalReceived += proof.amount;
          }
        }
      }
    }

    // 2. Get all claims made by this employee
    const claimRecords = await listClaimRecords(wallet);
    let totalClaimed = 0;
    for (const claim of claimRecords) {
      if (claim.status === "success" || claim.status === "submitted") {
        totalClaimed += claim.amount;
      }
    }

    const currentBalance = Math.max(0, totalReceived - totalClaimed);
    const currentBalanceMicro = Math.round(currentBalance * 1_000_000);

    return NextResponse.json({
      balance: currentBalanceMicro.toString(),
      location: "ephemeral"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
