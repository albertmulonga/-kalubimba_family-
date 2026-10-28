"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordField({
  id,
  name,
  placeholder,
  autoComplete,
  minLength,
  className,
}: {
  id: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="kf-password-wrap">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        className={className}
        required
      />
      <button
        type="button"
        className="kf-password-toggle"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
