import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Flower2, Save } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getMainMember } from "@/lib/data";
import { readFlash, withMessage } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { addDeceasedAction } from "@/lib/actions/family";
import { CloudinaryFileInput } from "@/components/CloudinaryFileInput";

export const metadata = { title: "Ajouter un membre décédé" };

export default async function AddDeceasedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const flash = await readFlash(params);
  const requestedId = Number(Array.isArray(params.member_id) ? params.member_id[0] : params.member_id);
  const target = requestedId ? { id: requestedId } : await getMainMember(session.id);

  if (!target) {
    redirect(withMessage("/family-tree", "error", "Créez d'abord votre profil familial."));
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Ajouter un membre décédé</h1>
          <p>Cette personne apparaîtra dans le mémorial de la famille.</p>
        </div>
        <Link href="/memorial" className="btn btn-ghost">
          <ArrowLeft size={16} /> Mémorial
        </Link>
      </div>

      <Alert success={flash.success} error={flash.error} info={flash.info} />

      <form action={addDeceasedAction} className="card">
        <input type="hidden" name="member_id" value={target.id} />
        <div className="card-head">
          <div>
            <h2>Souvenir d&apos;un proche</h2>
            <p>Renseignez les informations connues de la personne disparue.</p>
          </div>
          <Flower2 size={18} color="#7c3aed" />
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
              <label htmlFor="date_deces">Date de décès *</label>
              <input id="date_deces" name="date_deces" type="date" className="input" required />
            </div>
            <div className="field">
              <label htmlFor="lieu">Lieu</label>
              <input id="lieu" name="lieu" className="input" />
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
            <div className="field span-2">
              <label htmlFor="adresse">Adresse</label>
              <input id="adresse" name="adresse" className="input" />
            </div>
            <div className="field">
              <label htmlFor="nom_pere">Nom du père</label>
              <input id="nom_pere" name="nom_pere" className="input" />
            </div>
            <div className="field">
              <label htmlFor="nom_mere">Nom de la mère</label>
              <input id="nom_mere" name="nom_mere" className="input" />
            </div>
            <div className="field span-2">
              <label htmlFor="biographie">Hommage / biographie</label>
              <textarea id="biographie" name="biographie" className="textarea" />
            </div>
            <div className="form-actions span-2">
              <Link href="/memorial" className="btn btn-ghost">
                Annuler
              </Link>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Ajouter au mémorial
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
