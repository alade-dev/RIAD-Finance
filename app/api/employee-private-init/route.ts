import { NextRequest, NextResponse } from "next/server";
import { listEmployeesByWallet } from "@/lib/server/payroll-store";

export async function GET(request: NextRequest) {
  const employeeWallet = request.nextUrl.searchParams.get("employeeWallet")?.trim();
  if (!employeeWallet) {
    return NextResponse.json({ error: "Missing employeeWallet" }, { status: 400 });
  }

  try {
    const employees = await listEmployeesByWallet(employeeWallet);
    const registered = employees.length > 0;
    const initialized = registered; // For Arbitrum flow, we assume it's ready if registered.

    return NextResponse.json({
      employeeWallet,
      registered,
      initialized,
      status: initialized ? "confirmed" : "pending",
      message: initialized ? "Private account ready" : "Please register first"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
