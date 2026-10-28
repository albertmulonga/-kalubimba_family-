"use client";

import type { CSSProperties } from "react";

const FALLBACK =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#dbeafe"/>
          <stop offset="0.55" stop-color="#e0e7ff"/>
          <stop offset="1" stop-color="#d1fae5"/>
        </linearGradient>
      </defs>
      <rect width="640" height="480" fill="url(#g)"/>
      <circle cx="320" cy="212" r="58" fill="#ffffff" opacity="0.75"/>
      <path d="M245 330c18-54 54-82 75-82s57 28 75 82" fill="#ffffff" opacity="0.75"/>
      <text x="320" y="390" text-anchor="middle" font-family="Segoe UI, Arial" font-size="22" fill="#475569">Kalubimba Family</text>
    </svg>`,
  );

export function SafeImage({
  src,
  alt,
  className,
  style,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  loading?: "lazy" | "eager";
}) {
  return (
    <img
      src={src || FALLBACK}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src = FALLBACK;
      }}
    />
  );
}
