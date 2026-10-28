import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { startOrJoinCall } from "@/lib/calls";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    type?: string;
  } | null;
  const type = body?.type === "video" ? "video" : body?.type === "audio" ? "audio" : null;

  if (!type) {
    return NextResponse.json(
      { error: "Le type d'appel doit être audio ou video." },
      { status: 400 },
    );
  }

  try {
    const call = await startOrJoinCall(session.id, type);
    return NextResponse.json({ success: true, call });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible de démarrer l'appel." },
      { status: 500 },
    );
  }
}
