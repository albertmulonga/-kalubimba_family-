import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { getMember, getMembers } from "@/lib/data";
import { requireSession } from "@/lib/auth";
import { canUpdateMember } from "@/lib/permissions";
import { dateInputValue, mediaUrl } from "@/lib/format";
import { withMessage } from "@/lib/flash";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { updateMemberAction } from "@/lib/actions/members";

export const metadata = { title: "Modifier un membre" };

export default async function EditMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const memberId = Number(id);
  if (!Number.isFinite(memberId)) notFound();

  const session = await requireSession();
  if (!(await canUpdateMember(session, memberId))) {
    redirect(withMessage(`/members/${memberId}`, "error", "Vous n'avez pas la permission de modifier ce membre."));
  }

  const member = await getMember(memberId);
  if (!member) notFound();

  const [members, flash] = await Promise.all([getMembers(), readFlash(searchParams)]);
  const photo = mediaUrl(member.photo);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Modifier le profil</h1>
          <p>{member.nom_complet || `${member.prenom} ${member.nom}`}</p>
        </div>
        <Link href={`/members/${member.id}`} className="btn btn-ghost">
          <ArrowLeft size={16} /> Retour à la fiche
        </Link>
      </div>

      <Alert success={flash.success} error={flash.error} info={flash.info} />

      <form action={updateMemberAction.bind(null, member.id)} className="card">
        <div className="card-head">
          <div>
            <h2>Informations du membre</h2>
            <p>Mettez à jour les informations familiales.</p>
          </div>
          <Save size={18} color="#2563eb" />
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="prenom">Prénom *</label>
              <input id="prenom" name="prenom" className="input" defaultValue={member.prenom ?? ""} required />
            </div>
            <div className="field">
              <label htmlFor="nom">Nom *</label>
              <input id="nom" name="nom" className="input" defaultValue={member.nom} required />
            </div>
            <div className="field">
              <label htmlFor="genre">Genre</label>
              <select id="genre" name="genre" className="select" defaultValue={member.genre ?? "other"}>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="date_naissance">Date de naissance</label>
              <input
                id="date_naissance"
                name="date_naissance"
                type="date"
                className="input"
                defaultValue={dateInputValue(member.date_naissance)}
              />
            </div>
            <div className="field">
              <label htmlFor="date_deces">Date de décès</label>
              <input
                id="date_deces"
                name="date_deces"
                type="date"
                className="input"
                defaultValue={dateInputValue(member.date_deces)}
              />
            </div>
            <div className="field">
              <label htmlFor="lieu">Lieu</label>
              <input id="lieu" name="lieu" className="input" defaultValue={member.lieu ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="profession">Profession</label>
              <input
                id="profession"
                name="profession"
                className="input"
                defaultValue={member.profession ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="adresse">Adresse</label>
              <input id="adresse" name="adresse" className="input" defaultValue={member.adresse ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="pere_id">Père (membre existant)</label>
              <select id="pere_id" name="pere_id" className="select" defaultValue={member.pere_id ?? ""}>
                <option value="">Non renseigné</option>
                {members
                  .filter((option) => option.id !== member.id)
                  .map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.nom_complet || `${option.prenom} ${option.nom}`}
                    </option>
                  ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="mere_id">Mère (membre existant)</label>
              <select id="mere_id" name="mere_id" className="select" defaultValue={member.mere_id ?? ""}>
                <option value="">Non renseigné</option>
                {members
                  .filter((option) => option.id !== member.id)
                  .map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.nom_complet || `${option.prenom} ${option.nom}`}
                    </option>
                  ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="nom_pere">Nom du père (texte libre)</label>
              <input id="nom_pere" name="nom_pere" className="input" defaultValue={member.nom_pere ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="nom_mere">Nom de la mère (texte libre)</label>
              <input id="nom_mere" name="nom_mere" className="input" defaultValue={member.nom_mere ?? ""} />
            </div>
            <div className="field span-2">
              <label htmlFor="biographie">Biographie</label>
              <textarea
                id="biographie"
                name="biographie"
                className="textarea"
                defaultValue={member.biographie ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="photo">Nouvelle photo</label>
              <input id="photo" name="photo" type="file" accept="image/*" className="input" />
              {photo && (
                <label className="checkbox" style={{ marginTop: 6 }}>
                  <input type="checkbox" name="remove_photo" value="1" /> Supprimer la photo actuelle
                </label>
              )}
            </div>
            <div className="field">
              <label>Photo actuelle</label>
              {photo ? (
                <img
                  src={photo}
                  alt="Photo du membre"
                  style={{ width: 92, height: 92, objectFit: "cover", borderRadius: 16 }}
                />
              ) : (
                <span className="muted small">Aucune photo enregistrée.</span>
              )}
            </div>
            <div className="field span-2">
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="is_bloodline"
                  value="1"
                  defaultChecked={member.is_bloodline}
                />{" "}
                Membre de la lignée Kalubimba
              </label>
            </div>
            <div className="form-actions span-2">
              <Link href={`/members/${member.id}`} className="btn btn-ghost">
                Annuler
              </Link>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
