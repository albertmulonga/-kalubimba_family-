export type Flash = { success?: string; error?: string; info?: string };

export function withMessage(
  path: string,
  type: "success" | "error" | "info",
  message: string,
) {
  const [base, existing = ""] = path.split("?");
  const params = new URLSearchParams(existing);
  params.set(type, message);
  return `${base}?${params.toString()}`;
}

export async function readFlash(searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  return {
    success: first(params?.success),
    error: first(params?.error),
    info: first(params?.info),
  } satisfies Flash;
}
