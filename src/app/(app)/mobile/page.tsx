import Link from "next/link";
import {
  BookOpen,
  Cake,
  FileText,
  Images,
  Smartphone,
  TreePine,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getNextBirthdays, getStats } from "@/lib/data";
import { formatDate, fullName } from "@/lib/format";
import { Avatar } from "@/components/Avatar";

export const metadata = { title: "Version mobile" };

export default async function MobilePage() {
  await requireSession();
  const [stats, birthdays] = await Promise.all([getStats(), getNextBirthdays()]);

  const actions = [
    { href: "/family-tree", label: "Arbre", icon: TreePine, tone: "blue" },
    { href: "/members", label: "Membres", icon: Users, tone: "green" },
    { href: "/reunions", label: "Comptes rendus", icon: FileText, tone: "violet" },
    { href: "/photos", label: "Photos", icon: Images, tone: "rose" },
    { href: "/videos", label: "Vidéos", icon: Video, tone: "blue" },
    { href: "/history", label: "Histoire", icon: BookOpen, tone: "rose" },
    { href: "/members/new", label: "Ajouter", icon: UserPlus, tone: "green" },
    { href: "/settings", label: "Réglages", icon: Smartphone, tone: "violet" },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Version mobile</h1>
          <p>Accès rapide aux fonctions essentielles depuis votre téléphone.</p>
        </div>
        <span className="badge badge-blue">
          <Smartphone size={13} /> Optimisé mobile
        </span>
      </div>

      <section className="mobile-hero">
        <div>
          <p className="tiny" style={{ opacity: 0.85 }}>Famille Kalubimba</p>
          <h2>{stats.members} membres, une seule famille.</h2>
          <p className="small" style={{ opacity: 0.9, marginTop: 6 }}>
            {stats.living} vivants · {stats.deceased} en mémoire · {stats.photos + stats.videos} souvenirs
          </p>
        </div>
      </section>

      <div className="mobile-grid">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="mobile-tile">
            <span className={`stat-icon ${action.tone}`}>
              <action.icon size={20} />
            </span>
            <strong>{action.label}</strong>
          </Link>
        ))}
      </div>

      <section className="card" style={{ marginTop: 20 }}>
        <div className="card-head">
          <div>
            <h2>Anniversaires à venir</h2>
            <p>Les prochaines célébrations dans les 30 jours.</p>
          </div>
          <Cake size={18} color="#e11d48" />
        </div>
        <div className="card-body stack">
          {birthdays.length === 0 ? (
            <p className="muted small">Aucun anniversaire dans les 30 prochains jours.</p>
          ) : (
            birthdays.map(({ member, days }) => (
              <Link key={member.id} href={`/members/${member.id}`} className="row-between mobile-birthday">
                <div className="row" style={{ gap: 10 }}>
                  <Avatar
                    nom={member.nom}
                    prenom={member.prenom}
                    nomComplet={member.nom_complet}
                    photo={member.photo}
                    size="sm"
                  />
                  <div>
                    <strong>{fullName(member)}</strong>
                    <span className="tiny muted" style={{ display: "block" }}>
                      {formatDate(member.date_naissance)}
                    </span>
                  </div>
                </div>
                <span className="badge badge-green">
                  {days === 0 ? "Aujourd'hui" : `Dans ${days} j`}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </>
  );
}
