import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCall } from "@/lib/calls";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "Appel invalide." }, { status: 400 });
  }

  const call = await getCall(id, session.id);
  if (!call) {
    return NextResponse.json({ error: "Appel introuvable." }, { status: 404 });
  }

  return NextResponse.json({ call });
}
