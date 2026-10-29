import Link from "next/link";
import { Save, Users } from "lucide-react";
import type { MemberRow } from "@/lib/data";
import { dateInputValue, fullName } from "@/lib/format";
import { addParentsAction } from "@/lib/actions/family";
import { CloudinaryFileInput } from "./CloudinaryFileInput";

export function ParentsForm({
  target,
  father,
  mother,
}: {
  target: MemberRow;
  father?: MemberRow | null;
  mother?: MemberRow | null;
}) {
  return (
    <form action={addParentsAction} className="stack">
      <input type="hidden" name="member_id" value={target.id} />

      <section className="card">
        <div className="card-head">
          <div>
            <h2>Père</h2>
            <p>Le père de {fullName(target)}.</p>
          </div>
          <Users size={18} color="#2563eb" />
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="pere_nom_complet">Nom complet</label>
              <input
                id="pere_nom_complet"
                name="pere_nom_complet"
                className="input"
                defaultValue={father?.nom_complet ?? ""}
                placeholder="Prénom Nom"
              />
            </div>
            <div className="field">
              <label htmlFor="pere_date_naissance">Date de naissance</label>
              <input
                id="pere_date_naissance"
                name="pere_date_naissance"
                type="date"
                className="input"
                defaultValue={dateInputValue(father?.date_naissance)}
              />
            </div>
            <div className="field">
              <label htmlFor="pere_lieu">Lieu</label>
              <input id="pere_lieu" name="pere_lieu" className="input" defaultValue={father?.lieu ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="pere_profession">Profession</label>
              <input
                id="pere_profession"
                name="pere_profession"
                className="input"
                defaultValue={father?.profession ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="pere_photo">Photo</label>
              <CloudinaryFileInput
                name="pere_photo_url"
                accept="image/*"
                cloudName={process.env.CLOUDINARY_CLOUD_NAME ?? ""}
                uploadPreset={process.env.CLOUDINARY_UPLOAD_PRESET ?? ""}
                folder="kalubimba/members"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div>
            <h2>Mère</h2>
            <p>La mère de {fullName(target)}.</p>
          </div>
          <Users size={18} color="#059669" />
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="mere_nom_complet">Nom complet</label>
              <input
                id="mere_nom_complet"
                name="mere_nom_complet"
                className="input"
                defaultValue={mother?.nom_complet ?? ""}
                placeholder="Prénom Nom"
              />
            </div>
            <div className="field">
              <label htmlFor="mere_date_naissance">Date de naissance</label>
              <input
                id="mere_date_naissance"
                name="mere_date_naissance"
                type="date"
                className="input"
                defaultValue={dateInputValue(mother?.date_naissance)}
              />
            </div>
            <div className="field">
              <label htmlFor="mere_lieu">Lieu</label>
              <input id="mere_lieu" name="mere_lieu" className="input" defaultValue={mother?.lieu ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="mere_profession">Profession</label>
              <input
                id="mere_profession"
                name="mere_profession"
                className="input"
                defaultValue={mother?.profession ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="mere_photo">Photo</label>
              <CloudinaryFileInput
                name="mere_photo_url"
                accept="image/*"
                cloudName={process.env.CLOUDINARY_CLOUD_NAME ?? ""}
                uploadPreset={process.env.CLOUDINARY_UPLOAD_PRESET ?? ""}
                folder="kalubimba/members"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="form-actions">
        <Link href={`/members/${target.id}`} className="btn btn-ghost">
          Annuler
        </Link>
        <button type="submit" className="btn btn-primary">
          <Save size={16} /> Enregistrer les parents
        </button>
      </div>
    </form>
  );
}
