import Link from "next/link";
import { ArrowLeft, TreePine } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getAllMembers, getCouples, getRelationships } from "@/lib/data";
import { FamilyTree } from "@/components/FamilyTree";
import { PrintButton } from "@/components/PrintButton";

export const metadata = { title: "Arbre généalogique - Export PDF" };

export default async function FamilyTreePdfPage() {
  await requireSession();
  const [members, couples, relationships] = await Promise.all([
    getAllMembers(),
    getCouples(),
    getRelationships(),
  ]);

  return (
    <main className="print-page">
      <div className="print-toolbar no-print">
        <Link href="/family-tree" className="btn btn-ghost">
          <ArrowLeft size={16} /> Retour à l&apos;arbre
        </Link>
        <PrintButton />
      </div>

      <header className="print-head">
        <div className="print-brand">
          <span className="logo"><img src="/images/logo.svg" alt="Kalubimba Family" /></span>
          <div>
            <strong>Kalubimba Family</strong>
            <span>Arbre généalogique officiel</span>
          </div>
        </div>
        <div className="print-meta">
          <TreePine size={18} />
          <span>
            {members.length} membre{members.length > 1 ? "s" : ""} · {couples.length} union
            {couples.length > 1 ? "s" : ""}
          </span>
        </div>
      </header>

      <section className="print-title">
        <h1>Les générations de la famille Kalubimba</h1>
        <p>
          Document généré le{" "}
          {new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }).format(new Date())}
        </p>
      </section>

      <FamilyTree
        members={members}
        couples={couples}
        relationships={relationships.map((link) => ({
          parent_id: link.parent_id,
          child_id: link.child_id,
        }))}
        canEdit={false}
      />

      <footer className="print-foot">
        Kalubimba Family · Mémoire familiale · {new Date().getFullYear()}
      </footer>
    </main>
  );
}
