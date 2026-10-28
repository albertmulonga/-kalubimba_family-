import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Baby, Save } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getMainMember, getMember } from "@/lib/data";
import { canUpdateMember } from "@/lib/permissions";
import { fullName } from "@/lib/format";
import { readFlash, withMessage } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { PasswordField } from "@/components/PasswordField";
import { addChildAction } from "@/lib/actions/family";
import { shouldCreateChildAccount } from "@/lib/family-rules";

export const metadata = { title: "Ajouter un enfant" };

export default async function AddChildPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const flash = await readFlash(params);
  const requestedId = Number(Array.isArray(params.member_id) ? params.member_id[0] : params.member_id);
  const parent = requestedId ? await getMember(requestedId) : await getMainMember(session.id);

  if (!parent) {
    redirect(withMessage("/family-tree", "error", "Aucun parent cible. Créez d'abord un membre."));
  }
  if (!(await canUpdateMember(session, parent.id))) {
    redirect(withMessage(`/members/${parent.id}`, "error", "Vous n'avez pas la permission d'ajouter un enfant à ce membre."));
  }

  const spouse = parent.conjoint_id ? await getMember(parent.conjoint_id) : null;
  const shouldCreateAccount = await shouldCreateChildAccount(session, parent);
  const accountHint = shouldCreateAccount
    ? "Un compte sera créé automatiquement : le matricule est généré par l'application et vous choisissez le mot de passe."
    : "Cet enfant sera ajouté à l'arbre sans compte de connexion.";

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Ajouter un enfant</h1>
          <p>
            Enfant de <strong>{fullName(parent)}</strong>
            {spouse ? ` et ${fullName(spouse)}` : ""}.
          </p>
        </div>
        <Link href={`/members/${parent.id}`} className="btn btn-ghost">
          <ArrowLeft size={16} /> Retour
        </Link>
      </div>

      <Alert success={flash.success} error={flash.error} info={flash.info} />

      <form action={addChildAction} className="card">
        <input type="hidden" name="member_id" value={parent.id} />
        <div className="card-head">
          <div>
            <h2>Identité de l&apos;enfant</h2>
            <p>{accountHint}</p>
          </div>
          <Baby size={18} color="#2563eb" />
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="nom_complet">Nom complet *</label>
              <input id="nom_complet" name="nom_complet" className="input" required />
            </div>
            <div className="field">
              <label htmlFor="genre">Genre</label>
              <select id="genre" name="genre" className="select" defaultValue="male">
                <option value="male">Garçon</option>
                <option value="female">Fille</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="date_naissance">Date de naissance</label>
              <input id="date_naissance" name="date_naissance" type="date" className="input" />
            </div>
            <div className="field">
              <label htmlFor="lieu">Lieu de naissance</label>
              <input id="lieu" name="lieu" className="input" />
            </div>
            <div className="field">
              <label htmlFor="profession">Profession</label>
              <input id="profession" name="profession" className="input" />
            </div>
            <div className="field">
              <label htmlFor="nom_pere">Nom du père (texte libre)</label>
              <input id="nom_pere" name="nom_pere" className="input" defaultValue={parent.nom_pere ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="nom_mere">Nom de la mère (texte libre)</label>
              <input id="nom_mere" name="nom_mere" className="input" defaultValue={spouse?.nom_complet ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="photo">Photo</label>
              <input id="photo" name="photo" type="file" accept="image/*" className="input" />
            </div>
            {shouldCreateAccount ? (
              <>
                <div className="field">
                  <label htmlFor="mot_de_passe_enfant">Mot de passe du compte enfant *</label>
                  <PasswordField
                    id="mot_de_passe_enfant"
                    name="mot_de_passe_enfant"
                    className="input"
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="6 caractères minimum"
                  />
                </div>
                <div className="field">
                  <label htmlFor="mot_de_passe_enfant_confirmation">
                    Confirmer le mot de passe *
                  </label>
                  <PasswordField
                    id="mot_de_passe_enfant_confirmation"
                    name="mot_de_passe_enfant_confirmation"
                    className="input"
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Répétez le mot de passe"
                  />
                </div>
                <div className="field span-2">
                  <span className="hint">
                    Le matricule sera généré automatiquement. Seuls les parents verront ces
                    identifiants.
                  </span>
                </div>
              </>
            ) : (
              <div className="field span-2">
                <span className="hint">
                  Aucun compte de connexion ne sera créé pour cet enfant.
                </span>
              </div>
            )}
            <div className="form-actions span-2">
              <Link href={`/members/${parent.id}`} className="btn btn-ghost">
                Annuler
              </Link>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Ajouter l&apos;enfant
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
