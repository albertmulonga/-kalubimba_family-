function extensionFor(url: string) {
  try {
    const pathname = new URL(url, window.location.href).pathname;
    const match = /\.([a-z0-9]{2,5})$/i.exec(pathname);
    return match?.[1]?.toLowerCase() ?? "jpg";
  } catch {
    return "jpg";
  }
}

function filenameFor(label: string, url: string) {
  const cleaned = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${cleaned || "media-kalubimba"}.${extensionFor(url)}`;
}

export async function downloadMedia(url: string, label: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Téléchargement impossible");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filenameFor(label, url);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
