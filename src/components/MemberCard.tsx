import Link from "next/link";
import { Cake, MapPin } from "lucide-react";
import { ProfilePhoto } from "./ProfilePhoto";
import { age, fullName, genderLabel } from "@/lib/format";
import type { MemberWithAccount } from "@/lib/data";

export function MemberCard({ member }: { member: MemberWithAccount }) {
  const years = age(member.date_naissance, member.date_deces);
  return (
    <div className="member-card">
      <ProfilePhoto
        nom={member.nom}
        prenom={member.prenom}
        nomComplet={member.nom_complet}
        photo={member.photo}
        size="lg"
      />
      <div className="info">
        <Link href={`/members/${member.id}`} className="member-card-link">
          <strong>{fullName(member)}</strong>
          <span>{member.profession || genderLabel(member.genre)}</span>
          <div className="row wrap" style={{ gap: 6, marginTop: 7 }}>
            {member.date_deces ? (
              <span className="badge badge-rose">En mémoire</span>
            ) : (
              <span className="badge badge-green">Vivant</span>
            )}
            {years !== null && (
              <span className="badge">
                <Cake size={11} /> {years} ans
              </span>
            )}
            {member.lieu && (
              <span className="badge">
                <MapPin size={11} /> {member.lieu}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
