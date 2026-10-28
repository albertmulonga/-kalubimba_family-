"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" className="btn btn-primary" onClick={() => window.print()}>
      <Printer size={16} /> Imprimer / Enregistrer en PDF
    </button>
  );
}
