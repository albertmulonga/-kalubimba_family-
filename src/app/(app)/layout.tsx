import { requireSession } from "@/lib/auth";
import { getCurrentUser, getMainMember } from "@/lib/data";
import { AppShell } from "@/components/AppShell";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const [user, member] = await Promise.all([
    getCurrentUser(session.id).catch(() => null),
    getMainMember(session.id).catch(() => null),
  ]);
  const photo = user?.photo ?? member?.photo ?? null;

  return (
    <AppShell user={session} photo={photo}>
      {children}
    </AppShell>
  );
}
