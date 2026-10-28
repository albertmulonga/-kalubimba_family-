import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { endCall } from "@/lib/calls";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const callId = Number(id);
  if (!callId) {
    return NextResponse.json({ error: "Appel invalide." }, { status: 400 });
  }

  const result = await endCall(callId, session.id, session.isAdmin);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ success: true, call: result.call });
}
