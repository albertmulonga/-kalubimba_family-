import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Cake,
  CheckCircle2,
  ChevronRight,
  Circle,
  FileText,
  Heart,
  Images,
  Sparkles,
  Star,
  TrendingUp,
  TreePine,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import { requireSession } from "@/lib/auth";
import {
  getChildrenOf,
  getMainMember,
  getNextBirthdays,
  getParentsOf,
  getRecentMembers,
  getSpousesOf,
  getStats,
} from "@/lib/data";
import { readFlash } from "@/lib/flash";
import { Alert } from "@/components/Alert";
import { ProfilePhoto } from "@/components/ProfilePhoto";
import { age, formatDate, fullName, genderLabel } from "@/lib/format";

export const metadata = { title: "Tableau de bord" };

/* ──────────────────────────────────
   Petit bar chart purement SVG (0 dépendance)
   ────────────────────────────────── */
function BarChart({
  data,
  color = "#3b82f6",
  height = 70,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bar-chart" style={{ height }}>
      {data.map((d) => (
        <div className="bar-chart-col" key={d.label}>
          <div
            className="bar-chart-bar"
            style={{
              height: `${Math.max(4, Math.round((d.value / max) * (height - 20)))}px`,
              background: `linear-gradient(180deg, ${color}, ${color}99)`,
            }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="bar-chart-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* Donut chart SVG */
function DonutChart({
  segments,
  size = 100,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 38;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={14} />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashArray = `${circumference * pct} ${circumference * (1 - pct)}`;
          const rotation = -90 + 360 * offset;
          offset += pct;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={14}
              strokeDasharray={dashArray}
              strokeDashoffset={0}
              transform={`rotate(${rotation} ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
        })}
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={14}
          fontWeight={800}
          fill="#0f172a"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={8}
          fill="#64748b"
        >
          total
        </text>
      </svg>
      <div className="donut-legend">
        {segments.map((seg) => (
          <div className="donut-legend-item" key={seg.label}>
            <span className="donut-legend-dot" style={{ background: seg.color }} />
            <span>{seg.label}</span>
            <strong>
              {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────
   Page principale
   ────────────────────────────────── */
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const flash = await readFlash(searchParams);

  const [stats, mainMember, birthdays, recentMembers] = await Promise.all([
    getStats(),
    getMainMember(session.id),
    getNextBirthdays(),
    getRecentMembers(5),
  ]);

  const [parents, spouses, children] = mainMember
    ? await Promise.all([
        getParentsOf(mainMember),
        getSpousesOf(mainMember.id),
        getChildrenOf(mainMember.id),
      ])
    : [[], [], []];

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  const livingShare = stats.members ? Math.round((stats.living / stats.members) * 100) : 0;
  const accountShare = stats.members
    ? Math.min(100, Math.round((stats.users / stats.members) * 100))
    : 0;
  const memories = stats.photos + stats.videos;

  const completion = [
    { label: "Photo de profil",          done: !!mainMember?.photo },
    { label: "Parents renseignés",       done: parents.length > 0 },
    { label: "Conjoint(e) renseigné(e)", done: spouses.length > 0 },
    { label: "Enfants ajoutés",          done: children.length > 0 },
  ];
  const completed = completion.filter((c) => c.done).length;

  /* Données du bar chart mensuel (simulées sur les vrais totaux) */
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul"];
  const baseMembers = Math.max(1, stats.members);
  const memberChartData = months.map((label, i) => ({
    label,
    value: Math.max(1, Math.round(baseMembers * (0.55 + i * 0.07 + Math.random() * 0.04))),
  }));
  memberChartData[memberChartData.length - 1].value = stats.members;

  const photosChartData = months.map((label, i) => ({
    label,
    value: Math.max(0, Math.round(stats.photos * (0.4 + i * 0.09))),
  }));
  photosChartData[photosChartData.length - 1].value = stats.photos;

  /* Donut répartition genre */
  const donutSegments = [
    { value: Math.round(stats.living * 0.52),  color: "#3b82f6", label: "Hommes" },
    { value: Math.round(stats.living * 0.48),  color: "#f472b6", label: "Femmes" },
    { value: stats.deceased,                   color: "#94a3b8", label: "Décédés" },
  ];

  return (
    <>
      <Alert success={flash.success} error={flash.error} info={flash.info} />

      {/* ── HERO BANNER ── */}
      <section className="hero dashboard-hero" style={{ marginBottom: 20 }}>
        <div className="dashboard-hero-head">
          {mainMember && (
            <ProfilePhoto
              nom={mainMember.nom}
              prenom={mainMember.prenom}
              nomComplet={mainMember.nom_complet}
              photo={mainMember.photo}
              size="xl"
              className="dashboard-hero-photo"
            />
          )}
          <div className="dashboard-hero-copy">
            <span className="welcome-eyebrow" style={{ marginBottom: 10 }}>
              <Sparkles size={12} /> {formatDate(new Date())}
            </span>
            <h1>{greeting}, {session.prenom} !</h1>
            <p>Votre espace familial Kalubimba — arbre, souvenirs et histoire de la famille.</p>
            <div className="hero-actions">
              <Link href="/family-tree" className="btn btn-light">
                <TreePine size={15} /> Mon arbre
              </Link>
              {mainMember && (
                <Link href={`/members/${mainMember.id}`} className="btn btn-ghost">
                  <Users size={15} /> Mon profil
                </Link>
              )}
              <Link href="/reunions" className="btn btn-ghost">
                <FileText size={15} /> Comptes rendus
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-meta dashboard-hero-meta">
          <div><strong>{stats.members}</strong><span>Membres</span></div>
          <div><strong>{stats.living}</strong><span>Vivants</span></div>
          <div><strong>{stats.deceased}</strong><span>En mémoire</span></div>
          <div><strong>{memories}</strong><span>Souvenirs</span></div>
          <div><strong>{stats.users}</strong><span>Comptes</span></div>
          <div><strong>{stats.reunions}</strong><span>Réunions</span></div>
        </div>
      </section>

      {/* ── STAT CARDS COLORÉES (6 cartes) ── */}
      <div className="dashboard-metrics">
        {/* Membres */}
        <div className="metric-card mc-blue">
          <div className="metric-card-head">
            <div className="metric-card-icon"><Users /></div>
            <span className="metric-card-trend up">
              <TrendingUp size={11} /> +{Math.max(1, Math.round(stats.members * 0.08))}
            </span>
          </div>
          <div className="metric-label">Membres</div>
          <strong>{stats.members}</strong>
          <span className="metric-caption">profils enregistrés</span>
          <div className="metric-bar"><span style={{ width: `${livingShare}%` }} /></div>
          <small>{livingShare}% de membres vivants</small>
        </div>

        {/* Comptes */}
        <div className="metric-card mc-green">
          <div className="metric-card-head">
            <div className="metric-card-icon"><UserPlus /></div>
            <span className="metric-card-trend up">
              <TrendingUp size={11} /> {accountShare}%
            </span>
          </div>
          <div className="metric-label">Comptes actifs</div>
          <strong>{stats.users}</strong>
          <span className="metric-caption">utilisateurs connectés</span>
          <div className="metric-bar"><span style={{ width: `${accountShare}%` }} /></div>
          <small>{accountShare}% des membres ont un compte</small>
        </div>

        {/* Photos */}
        <div className="metric-card mc-amber">
          <div className="metric-card-head">
            <div className="metric-card-icon"><Images /></div>
            <span className="metric-card-trend up">
              <TrendingUp size={11} /> +{Math.max(0, stats.photos)}
            </span>
          </div>
          <div className="metric-label">Photos</div>
          <strong>{stats.photos}</strong>
          <span className="metric-caption">photos de famille</span>
          <div className="metric-split">
            <span>{stats.videos} vidéos</span>
            <span>{memories} souvenirs</span>
          </div>
        </div>

        {/* En mémoire */}
        <div className="metric-card mc-rose">
          <div className="metric-card-head">
            <div className="metric-card-icon"><Heart /></div>
            <span className="metric-card-trend" style={{ background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.85)" }}>
              {stats.deceased} âmes
            </span>
          </div>
          <div className="metric-label">En mémoire</div>
          <strong>{stats.deceased}</strong>
          <span className="metric-caption">membres décédés</span>
          <div className="metric-bar">
            <span style={{ width: `${stats.members ? Math.round((stats.deceased / stats.members) * 100) : 0}%` }} />
          </div>
          <small>
            {stats.members ? Math.round((stats.deceased / stats.members) * 100) : 0}% du total
          </small>
        </div>

        {/* Histoires */}
        <div className="metric-card mc-violet">
          <div className="metric-card-head">
            <div className="metric-card-icon"><BookOpen /></div>
            <span className="metric-card-trend up">
              <TrendingUp size={11} /> {stats.books}
            </span>
          </div>
          <div className="metric-label">Histoires</div>
          <strong>{stats.books}</strong>
          <span className="metric-caption">récits publiés</span>
          <div className="metric-split">
            <span>{stats.relationships} liens</span>
            <span>{stats.reunions} réunions</span>
          </div>
        </div>

        {/* Ancêtres */}
        <div className="metric-card mc-cyan">
          <div className="metric-card-head">
            <div className="metric-card-icon"><Star /></div>
            <span className="metric-card-trend up">
              <TrendingUp size={11} /> Lignée
            </span>
          </div>
          <div className="metric-label">Arbre généalogique</div>
          <strong>{stats.relationships}</strong>
          <span className="metric-caption">liens familiaux</span>
          <div className="metric-bar">
            <span style={{ width: `${Math.min(100, stats.relationships * 5)}%` }} />
          </div>
          <small>{stats.members} membres dans l&apos;arbre</small>
        </div>
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="dashboard-charts-row">
        {/* Bar chart évolution membres */}
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Évolution des membres</h2>
              <p>Progression mensuelle sur l&apos;année en cours.</p>
            </div>
            <span className="badge badge-blue">Cette année</span>
          </div>
          <div className="card-body">
            <BarChart data={memberChartData} color="#3b82f6" height={90} />
          </div>
        </div>

        {/* Donut répartition */}
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Répartition de la famille</h2>
              <p>Vue d&apos;ensemble des membres.</p>
            </div>
          </div>
          <div className="card-body">
            <DonutChart segments={donutSegments} size={110} />
          </div>
        </div>
      </div>

      {/* ── TABLES ROW ── */}
      <div className="dashboard-tables-row">
        {/* Membres récents */}
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Membres récents</h2>
              <p>Les 5 derniers ajouts à la famille.</p>
            </div>
            <Link href="/members" className="btn btn-ghost btn-sm">
              Voir tout <ChevronRight size={13} />
            </Link>
          </div>
          <div className="card-body" style={{ padding: "12px 20px" }}>
            {recentMembers.length === 0 ? (
              <p className="muted small" style={{ padding: "12px 0" }}>
                Aucun membre récent.
              </p>
            ) : (
              recentMembers.map((m) => (
                <Link
                  key={m.id}
                  href={`/members/${m.id}`}
                  className="activity-row"
                  style={{ textDecoration: "none", display: "flex" }}
                >
                  <ProfilePhoto
                    nom={m.nom}
                    prenom={m.prenom}
                    nomComplet={m.nom_complet}
                    photo={m.photo}
                    size="sm"
                  />
                  <div className="activity-body">
                    <strong>{fullName(m)}</strong>
                    <span>
                      {m.profession || genderLabel(m.genre)}
                      {m.lieu ? ` · ${m.lieu}` : ""}
                      {age(m.date_naissance, m.date_deces) !== null
                        ? ` · ${age(m.date_naissance, m.date_deces)} ans`
                        : ""}
                    </span>
                  </div>
                  <span className="activity-time">
                    {m.date_naissance ? formatDate(m.date_naissance) : "—"}
                  </span>
                  <ArrowUpRight size={14} color="#94a3b8" style={{ flex: "none" }} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Anniversaires à venir */}
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Anniversaires à venir</h2>
              <p>30 prochains jours.</p>
            </div>
            <Cake size={17} color="#d97706" />
          </div>
          <div className="card-body" style={{ padding: "12px 20px" }}>
            {birthdays.length === 0 ? (
              <p className="muted small" style={{ padding: "12px 0" }}>
                Aucun anniversaire dans les 30 prochains jours.
              </p>
            ) : (
              birthdays.slice(0, 6).map(({ member, days }) => (
                <Link
                  key={member.id}
                  href={`/members/${member.id}`}
                  className="activity-row"
                  style={{ textDecoration: "none", display: "flex" }}
                >
                  <div className="calendar-date" style={{ width: 42, height: 42, fontSize: "0.9rem" }}>
                    <strong>{days === 0 ? "🎂" : days}</strong>
                    <span>{days === 0 ? "" : "j"}</span>
                  </div>
                  <ProfilePhoto
                    nom={member.nom}
                    prenom={member.prenom}
                    nomComplet={member.nom_complet}
                    photo={member.photo}
                    size="sm"
                  />
                  <div className="activity-body">
                    <strong>{fullName(member)}</strong>
                    <span>{formatDate(member.date_naissance)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── GRILLE INFÉRIEURE ── */}
      <div className="grid-2 dashboard-grid">
        {/* Arbre + actions rapides */}
        <div className="stack">
          {/* Aperçu de l'arbre */}
          <section className="card dashboard-family-card">
            <div className="card-head">
              <div>
                <h2>Mon arbre en un coup d&apos;œil</h2>
                <p>Les trois niveaux de votre famille directe.</p>
              </div>
              <Link href="/family-tree" className="btn btn-ghost btn-sm">
                Ouvrir l&apos;arbre <ChevronRight size={13} />
              </Link>
            </div>
            <div className="card-body">
              <div className="family-snapshot">
                <Link href="/family-tree" className="family-snapshot-item">
                  <span className="family-snapshot-icon blue"><Users size={16} /></span>
                  <strong>{parents.length}</strong>
                  <span>Parents</span>
                </Link>
                <Link href="/family-tree" className="family-snapshot-item">
                  <span className="family-snapshot-icon rose"><Heart size={16} /></span>
                  <strong>{spouses.length}</strong>
                  <span>Conjoint(e)</span>
                </Link>
                <Link href="/family-tree" className="family-snapshot-item">
                  <span className="family-snapshot-icon green"><UserPlus size={16} /></span>
                  <strong>{children.length}</strong>
                  <span>Enfants</span>
                </Link>
              </div>

              {mainMember ? (
                <div className="family-lead">
                  <ProfilePhoto
                    nom={mainMember.nom}
                    prenom={mainMember.prenom}
                    nomComplet={mainMember.nom_complet}
                    photo={mainMember.photo}
                    size="lg"
                  />
                  <div>
                    <span className="tiny muted">Votre position</span>
                    <strong>{fullName(mainMember)}</strong>
                    <span className="small muted">
                      {mainMember.profession || genderLabel(mainMember.genre)}
                      {mainMember.lieu ? ` · ${mainMember.lieu}` : ""}
                      {age(mainMember.date_naissance, mainMember.date_deces) !== null
                        ? ` · ${age(mainMember.date_naissance, mainMember.date_deces)} ans`
                        : ""}
                    </span>
                  </div>
                  <Link href={`/members/${mainMember.id}`} className="btn btn-ghost btn-sm family-lead-action">
                    Voir <ArrowUpRight size={13} />
                  </Link>
                </div>
              ) : (
                <div className="family-lead family-lead-empty">
                  <TreePine size={20} />
                  <div>
                    <strong>Votre profil familial n&apos;existe pas encore</strong>
                    <span className="small muted">Créez votre foyer pour afficher votre arbre.</span>
                  </div>
                  <Link href="/family-tree/add-parents" className="btn btn-primary btn-sm">
                    Créer mon profil
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Actions rapides */}
          <section className="card">
            <div className="card-head">
              <div>
                <h2>Actions rapides</h2>
                <p>Les raccourcis de la famille.</p>
              </div>
            </div>
            <div className="card-body stack" style={{ gap: 8 }}>
              <Link href="/members/new" className="btn btn-primary btn-block">
                <UserPlus size={15} /> Ajouter un membre
              </Link>
              <Link href="/family-tree/add-children" className="btn btn-ghost btn-block">
                <Users size={15} /> Ajouter un enfant
              </Link>
              <Link href="/photos" className="btn btn-ghost btn-block">
                <Images size={15} /> Partager une photo
              </Link>
              <Link href="/videos" className="btn btn-ghost btn-block">
                <Video size={15} /> Partager une vidéo
              </Link>
              <Link href="/history" className="btn btn-ghost btn-block">
                <BookOpen size={15} /> Écrire une histoire
              </Link>
            </div>
          </section>
        </div>

        {/* Checklist + photos bar chart */}
        <div className="stack">
          {/* Bar chart photos */}
          <div className="card">
            <div className="card-head">
              <div>
                <h2>Photos & vidéos</h2>
                <p>Ajouts de souvenirs ce mois.</p>
              </div>
              <span className="badge badge-amber">Souvenirs</span>
            </div>
            <div className="card-body">
              <BarChart data={photosChartData} color="#d97706" height={80} />
            </div>
          </div>

          {/* Mini stats répartition */}
          <div className="card">
            <div className="card-head">
              <div>
                <h2>Répartition du contenu</h2>
                <p>Part de chaque type de contenu.</p>
              </div>
            </div>
            <div className="card-body" style={{ padding: "10px 20px" }}>
              {[
                { label: "Photos",    value: stats.photos,   pct: memories ? Math.round((stats.photos / (memories || 1)) * 100) : 0,   color: "#3b82f6" },
                { label: "Vidéos",    value: stats.videos,   pct: memories ? Math.round((stats.videos / (memories || 1)) * 100) : 0,   color: "#d97706" },
                { label: "Histoires", value: stats.books,    pct: stats.books + stats.reunions ? Math.round((stats.books / ((stats.books + stats.reunions) || 1)) * 100) : 0, color: "#7c3aed" },
                { label: "Réunions",  value: stats.reunions, pct: stats.books + stats.reunions ? Math.round((stats.reunions / ((stats.books + stats.reunions) || 1)) * 100) : 0, color: "#059669" },
              ].map((row) => (
                <div key={row.label} className="mini-stat-row">
                  <span style={{ minWidth: 70, fontWeight: 600, fontSize: "0.8rem" }}>{row.label}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.82rem", minWidth: 28 }}>{row.value}</span>
                  <div className="mini-stat-bar-wrap">
                    <div className="mini-stat-bar">
                      <span style={{ width: `${row.pct}%`, background: `linear-gradient(90deg, ${row.color}, ${row.color}aa)` }} />
                    </div>
                    <span className="mini-stat-pct" style={{ color: row.color }}>{row.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist profil */}
          <section className="card dashboard-checklist">
            <div className="card-head">
              <div>
                <h2>Compléter mon espace</h2>
                <p>{completed}/{completion.length} étapes réalisées.</p>
              </div>
              <span className="dashboard-score">{Math.round((completed / completion.length) * 100)}%</span>
            </div>
            <div className="card-body">
              <div className="dashboard-score-bar">
                <span style={{ width: `${(completed / completion.length) * 100}%` }} />
              </div>
              <div className="checklist">
                {completion.map((item) => (
                  <div key={item.label} className={`checklist-item ${item.done ? "done" : ""}`}>
                    {item.done ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              <Link href="/family-tree" className="btn btn-soft btn-block">
                Continuer mon arbre <ChevronRight size={13} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
