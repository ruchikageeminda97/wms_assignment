export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  if (!response.ok) {
    if (
      response.status === 401 &&
      path.startsWith("/api/backend/") &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new Event("gather:unauthorized"));
    }
    const record = payload as { message?: string | string[] } | null;
    const message = Array.isArray(record?.message)
      ? record.message.join(". ")
      : record?.message || `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }
  return payload as T;
}

export function backend(path: string, query?: URLSearchParams) {
  const search = query?.toString();
  return `/api/backend/${path.replace(/^\/+/, "")}${search ? `?${search}` : ""}`;
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(date));
}

export function formatDateTime(date: string) {
  return formatDate(date, { hour: "numeric", minute: "2-digit" });
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
