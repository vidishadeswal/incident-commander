export const API_BASE = "/api/backend/api/v1";

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail =
      typeof body === "object" && body && "detail" in body
        ? String((body as { detail?: string }).detail)
        : response.statusText;
    throw new Error(`${response.status} ${detail}`);
  }

  return body as T;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function toLocalDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}
