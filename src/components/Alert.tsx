import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export function Alert({
  success,
  error,
  info,
}: {
  success?: string;
  error?: string;
  info?: string;
}) {
  if (!success && !error && !info) return null;
  if (success) {
    return (
      <div className="alert alert-success" role="status">
        <CheckCircle2 size={18} style={{ flex: "none", marginTop: 1 }} />
        <span>{success}</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="alert alert-error" role="alert">
        <AlertCircle size={18} style={{ flex: "none", marginTop: 1 }} />
        <span>{error}</span>
      </div>
    );
  }
  return (
    <div className="alert alert-info" role="status">
      <Info size={18} style={{ flex: "none", marginTop: 1 }} />
      <span>{info}</span>
    </div>
  );
}
