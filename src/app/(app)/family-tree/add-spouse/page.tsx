import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Heart, Save } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getMainMember, getMember } from "@/lib/data";
import { canUpdateMember } from "@/lib/permissions";
import { dateInputValue, fullName, mediaUrl } from "@/lib/format";
import { readFlash, withMessage } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { addSpouseAction } from "@/lib/actions/family";

export const metadata = { title: "Ajouter un conjoint" };

export default async function AddSpousePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const flash = await readFlash(params);
  const requestedId = Number(Array.isArray(params.member_id) ? params.member_id[0] : params.member_id);
  const target = requestedId ? await getMember(requestedId) : await getMainMember(session.id);

  if (!target) {
    redirect(withMessage("/family-tree", "error", "Aucun membre cible. Créez d'abord un membre."));
  }
  if (!(await canUpdateMember(session, target.id))) {
    redirect(withMessage(`/members/${target.id}`, "error", "Vous n'avez pas la permission de modifier ce membre."));
  }

  const spouse = target.conjoint_id ? await getMember(target.conjoint_id) : null;
  const spousePhoto = mediaUrl(spouse?.photo);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{spouse ? "Modifier le conjoint" : "Ajouter un conjoint"}</h1>
          <p>
            Conjoint de <strong>{fullName(target)}</strong>.
          </p>
        </div>
        <Link href={`/members/${target.id}`} className="btn btn-ghost">
          <ArrowLeft size={16} /> Retour
        </Link>
      </div>

      <Alert success={flash.success} error={flash.error} info={flash.info} />

      <form action={addSpouseAction} className="card">
        <input type="hidden" name="member_id" value={target.id} />
        <div className="card-head">
          <div>
            <h2>Identité du conjoint</h2>
            <p>Le conjoint sera automatiquement relié à {fullName(target)}.</p>
          </div>
          <Heart size={18} color="#e11d48" />
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="spouse_nom_complet">Nom complet *</label>
              <input
                id="spouse_nom_complet"
                name="spouse_nom_complet"
                className="input"
                defaultValue={spouse?.nom_complet ?? ""}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="spouse_genre">Genre</label>
              <select
                id="spouse_genre"
                name="spouse_genre"
                className="select"
                defaultValue={spouse?.genre ?? (target.genre === "male" ? "female" : "male")}
              >
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="spouse_date_naissance">Date de naissance</label>
              <input
                id="spouse_date_naissance"
                name="spouse_date_naissance"
                type="date"
                className="input"
                defaultValue={dateInputValue(spouse?.date_naissance)}
              />
            </div>
            <div className="field">
              <label htmlFor="spouse_lieu">Lieu</label>
              <input id="spouse_lieu" name="spouse_lieu" className="input" defaultValue={spouse?.lieu ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="spouse_profession">Profession</label>
              <input
                id="spouse_profession"
                name="spouse_profession"
                className="input"
                defaultValue={spouse?.profession ?? ""}
              />
            </div>
            <div className="field span-2">
              <label htmlFor="spouse_adresse">Adresse</label>
              <input
                id="spouse_adresse"
                name="spouse_adresse"
                className="input"
                defaultValue={spouse?.adresse ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="spouse_nom_pere">Nom du père</label>
              <input
                id="spouse_nom_pere"
                name="spouse_nom_pere"
                className="input"
                defaultValue={spouse?.nom_pere ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="spouse_nom_mere">Nom de la mère</label>
              <input
                id="spouse_nom_mere"
                name="spouse_nom_mere"
                className="input"
                defaultValue={spouse?.nom_mere ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="spouse_photo">Photo</label>
              <input id="spouse_photo" name="spouse_photo" type="file" accept="image/*" className="input" />
            </div>
            <div className="field">
              <label>Photo actuelle</label>
              {spousePhoto ? (
                <img
                  src={spousePhoto}
                  alt="Conjoint"
                  style={{ width: 92, height: 92, objectFit: "cover", borderRadius: 16 }}
                />
              ) : (
                <span className="muted small">Aucune photo enregistrée.</span>
              )}
            </div>
            <div className="form-actions span-2">
              <Link href={`/members/${target.id}`} className="btn btn-ghost">
                Annuler
              </Link>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Enregistrer le conjoint
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
