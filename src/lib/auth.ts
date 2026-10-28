import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "kalubimba_session";
const MAX_AGE = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: number;
  nom: string;
  prenom: string;
  email: string | null;
  matricule: string | null;
  isAdmin: boolean;
};

function secretKey() {
  const secret =
    process.env.AUTH_SECRET ??
    "kalubimba-development-secret-please-change-in-production";
  return new TextEncoder().encode(secret);
}

export function isAdminEmail(email: string | null | undefined) {
  const admin = process.env.ADMIN_EMAIL ?? "adminkalubimba@gmail.com";
  return !!email && email.toLowerCase() === admin.toLowerCase();
}

export async function createSession(user: {
  id: number;
  nom: string;
  prenom: string;
  email: string | null;
  matricule: string | null;
}) {
  const payload: SessionUser = {
    id: Number(user.id),
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    matricule: user.matricule,
    isAdmin: isAdminEmail(user.email),
  };

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.id !== "number") return null;
    return {
      id: Number(payload.id),
      nom: String(payload.nom ?? ""),
      prenom: String(payload.prenom ?? ""),
      email: (payload.email as string | null) ?? null,
      matricule: (payload.matricule as string | null) ?? null,
      isAdmin: Boolean(payload.isAdmin),
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireSession();
  if (!session.isAdmin) redirect("/dashboard?error=Accès réservé aux administrateurs");
  return session;
}
