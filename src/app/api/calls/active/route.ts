import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getActiveCall } from "@/lib/calls";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const call = await getActiveCall(session.id);
  return NextResponse.json({
    has_active_call: !!call,
    call,
  });
}
