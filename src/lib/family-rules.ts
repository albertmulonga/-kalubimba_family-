import type { SessionUser } from "./auth";
import { getMainMember } from "./data";

type ParentForAccount = {
  id: number;
  genre: string | null;
  is_bloodline: boolean;
  utilisateur_id: number | null;
};

export async function shouldCreateChildAccount(
  session: SessionUser,
  parent: ParentForAccount,
): Promise<boolean> {
  if (!parent.is_bloodline) return false;

  const main = await getMainMember(session.id);
  if (main?.id === parent.id) return true;

  return parent.genre === "male" && parent.utilisateur_id !== null;
}
