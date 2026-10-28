"use client";

import { useEffect, useState } from "react";
import { initials, mediaUrl } from "@/lib/format";

export function Avatar({
  nom,
  prenom,
  nomComplet,
  photo,
  size,
}: {
  nom?: string | null;
  prenom?: string | null;
  nomComplet?: string | null;
  photo?: string | null;
  size?: "sm" | "lg" | "xl";
}) {
  const url = mediaUrl(photo);
  const [broken, setBroken] = useState(false);
  const className = ["avatar", size ? `avatar-${size}` : ""].filter(Boolean).join(" ");

  useEffect(() => {
    setBroken(false);
  }, [url]);

  return (
    <span className={className}>
      {url && !broken ? (
        <img
          src={url}
          alt={nomComplet || `${prenom ?? ""} ${nom ?? ""}`.trim()}
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        initials(prenom, nom ?? nomComplet ?? "M")
      )}
    </span>
  );
}
