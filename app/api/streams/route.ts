import { NextRequest, NextResponse } from "next/server";
import {
  createStream,
  listStreams,
  updateStreamConfig,
} from "@/lib/server/payroll-store";
import { saveComplianceEvent } from "@/lib/server/compliance-store";
import {
  isWalletAuthorizationError,
  verifyAuthorizedWalletRequest,
} from "@/lib/wallet-request-auth";

function getEmployerWalletFromRequest(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("employerWallet")?.trim();

  if (!wallet) {
    throw new Error("Missing employerWallet query parameter");
  }

  return wallet;
}

export async function GET(request: NextRequest) {
  try {
    const employerWallet = getEmployerWalletFromRequest(request);
    await verifyAuthorizedWalletRequest({
      headers: request.headers,
      expectedWallet: employerWallet,
      method: request.method,
      path: `${request.nextUrl.pathname}${request.nextUrl.search}`,
    });
    
    const streams = await listStreams(employerWallet);

    await saveComplianceEvent({
      actorWallet: employerWallet,
      action: "streams.read",
      route: request.nextUrl.pathname,
      subjectWallet: employerWallet,
      resourceType: "stream",
      status: "success",
    });

    return NextResponse.json({ streams });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to load streams";

    return NextResponse.json(
      { error: message },
      { status: isWalletAuthorizationError(error) ? 401 : 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody || "{}") as {
      employerWallet?: string;
      employeeId?: string;
      ratePerSecond?: number;
      startsAt?: string | null;
      endsAt?: string | null;
      payoutMode?: "base" | "ephemeral";
      allowedPayoutModes?: ("base" | "ephemeral")[];
      status?: "active" | "paused" | "stopped";
    };

    const employerWallet = body.employerWallet ?? "";
    await verifyAuthorizedWalletRequest({
      headers: request.headers,
      expectedWallet: employerWallet,
      method: request.method,
      path: request.nextUrl.pathname,
      body: rawBody,
    });

    const stream = await createStream({
      employerWallet,
      employeeId: body.employeeId ?? "",
      ratePerSecond: body.ratePerSecond ?? 0,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      payoutMode: body.payoutMode,
      allowedPayoutModes: body.allowedPayoutModes,
      status: body.status,
    });

    await saveComplianceEvent({
      actorWallet: employerWallet,
      action: "streams.create",
      route: request.nextUrl.pathname,
      subjectWallet: employerWallet,
      resourceType: "stream",
      resourceId: stream.id,
      status: "success",
    });

    return NextResponse.json({ stream }, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create stream";

    return NextResponse.json(
      { error: message },
      { status: isWalletAuthorizationError(error) ? 401 : 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody || "{}") as {
      employerWallet?: string;
      streamId?: string;
      ratePerSecond?: number;
      payoutMode?: "base" | "ephemeral";
      allowedPayoutModes?: ("base" | "ephemeral")[];
      status?: "active" | "paused" | "stopped";
    };

    const employerWallet = body.employerWallet ?? "";
    await verifyAuthorizedWalletRequest({
      headers: request.headers,
      expectedWallet: employerWallet,
      method: request.method,
      path: request.nextUrl.pathname,
      body: rawBody,
    });

    const stream = await updateStreamConfig({
      employerWallet,
      streamId: body.streamId ?? "",
      ratePerSecond: body.ratePerSecond,
      payoutMode: body.payoutMode,
      allowedPayoutModes: body.allowedPayoutModes,
      status: body.status,
    });

    await saveComplianceEvent({
      actorWallet: employerWallet,
      action: "streams.update",
      route: request.nextUrl.pathname,
      subjectWallet: employerWallet,
      resourceType: "stream",
      resourceId: stream.id,
      status: "success",
    });

    return NextResponse.json({ stream });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update stream";

    return NextResponse.json(
      { error: message },
      { status: isWalletAuthorizationError(error) ? 401 : 400 },
    );
  }
}
