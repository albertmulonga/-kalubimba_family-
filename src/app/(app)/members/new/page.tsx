import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { getMembers } from "@/lib/data";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { createMemberAction } from "@/lib/actions/members";
import { CloudinaryFileInput } from "@/components/CloudinaryFileInput";

export const metadata = { title: "Ajouter un membre" };

export default async function NewMemberPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await readFlash(searchParams);
  const members = await getMembers();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Ajouter un membre</h1>
          <p>Créez une nouvelle fiche membre dans l&apos;arbre familial.</p>
        </div>
        <Link href="/members" className="btn btn-ghost">
          <ArrowLeft size={16} /> Retour
        </Link>
      </div>

      <Alert success={flash.success} error={flash.error} info={flash.info} />

      <form action={createMemberAction} className="card">
        <div className="card-head">
          <div>
            <h2>Identité du membre</h2>
            <p>Les informations principales de la personne.</p>
          </div>
          <UserPlus size={18} color="#2563eb" />
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="prenom">Prénom *</label>
              <input id="prenom" name="prenom" className="input" required />
            </div>
            <div className="field">
              <label htmlFor="nom">Nom *</label>
              <input id="nom" name="nom" className="input" required />
            </div>
            <div className="field">
              <label htmlFor="genre">Genre</label>
              <select id="genre" name="genre" className="select" defaultValue="male">
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="date_naissance">Date de naissance</label>
              <input id="date_naissance" name="date_naissance" type="date" className="input" />
            </div>
            <div className="field">
              <label htmlFor="date_deces">Date de décès</label>
              <input id="date_deces" name="date_deces" type="date" className="input" />
              <span className="hint">Laissez vide si la personne est vivante.</span>
            </div>
            <div className="field">
              <label htmlFor="lieu">Lieu</label>
              <input id="lieu" name="lieu" className="input" placeholder="Ville, pays" />
            </div>
            <div className="field">
              <label htmlFor="profession">Profession</label>
              <input id="profession" name="profession" className="input" />
            </div>
            <div className="field">
              <label htmlFor="photo">Photo</label>
              <CloudinaryFileInput
                name="photo_url"
                accept="image/*"
                cloudName={process.env.CLOUDINARY_CLOUD_NAME ?? ""}
                uploadPreset={process.env.CLOUDINARY_UPLOAD_PRESET ?? ""}
                folder="kalubimba/members"
              />
            </div>
            <div className="field">
              <label htmlFor="pere_id">Père (membre existant)</label>
              <select id="pere_id" name="pere_id" className="select" defaultValue="">
                <option value="">Non renseigné</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.nom_complet || `${member.prenom} ${member.nom}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="mere_id">Mère (membre existant)</label>
              <select id="mere_id" name="mere_id" className="select" defaultValue="">
                <option value="">Non renseigné</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.nom_complet || `${member.prenom} ${member.nom}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="nom_pere">Nom du père (texte libre)</label>
              <input id="nom_pere" name="nom_pere" className="input" />
            </div>
            <div className="field">
              <label htmlFor="nom_mere">Nom de la mère (texte libre)</label>
              <input id="nom_mere" name="nom_mere" className="input" />
            </div>
            <div className="field span-2">
              <label htmlFor="adresse">Adresse</label>
              <input id="adresse" name="adresse" className="input" />
            </div>
            <div className="field span-2">
              <label htmlFor="biographie">Biographie</label>
              <textarea id="biographie" name="biographie" className="textarea" />
            </div>
            <div className="field span-2">
              <label className="checkbox">
                <input type="checkbox" name="is_bloodline" value="1" defaultChecked /> Membre de la
                lignée Kalubimba
              </label>
            </div>
            <div className="form-actions span-2">
              <Link href="/members" className="btn btn-ghost">
                Annuler
              </Link>
              <button type="submit" className="btn btn-primary">
                Enregistrer le membre
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
