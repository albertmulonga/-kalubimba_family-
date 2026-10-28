import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { getFamilyBook } from "@/lib/data";
import { formatDate, mediaUrl } from "@/lib/format";

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bookId = Number(id);
  if (!Number.isFinite(bookId)) notFound();

  const book = await getFamilyBook(bookId);
  if (!book) notFound();

  const file = mediaUrl(book.file_path);

  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/history" className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }}>
            <ArrowLeft size={15} /> Toutes les histoires
          </Link>
          <h1>{book.titre || "Souvenir de famille"}</h1>
          <p>
            {formatDate(book.date_histoire ?? book.date_publication)}
            {book.auteur_prenom ? ` · ${book.auteur_prenom} ${book.auteur_nom ?? ""}` : ""}
          </p>
        </div>
        {file && (
          <a href={file} target="_blank" rel="noreferrer" className="btn btn-primary">
            <Download size={16} /> Télécharger le document
          </a>
        )}
      </div>

      <article className="card">
        <div className="card-body">
          {book.description && <p className="lead">{book.description}</p>}
          {book.contenu ? (
            <div className="prose" style={{ whiteSpace: "pre-line" }}>
              {book.contenu}
            </div>
          ) : (
            <p className="muted">Cette histoire est disponible via le document joint.</p>
          )}
          {file && (
            <a href={file} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ marginTop: 20 }}>
              <FileText size={16} /> Ouvrir le document
            </a>
          )}
        </div>
      </article>
    </>
  );
}
