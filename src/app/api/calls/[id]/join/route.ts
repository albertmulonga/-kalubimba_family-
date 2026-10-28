import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { joinCall } from "@/lib/calls";

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

  try {
    const call = await joinCall(callId, session.id);
    if (!call) {
      return NextResponse.json({ error: "Appel introuvable." }, { status: 404 });
    }
    return NextResponse.json({ success: true, call });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible de rejoindre l'appel." },
      { status: 400 },
    );
  }
}
