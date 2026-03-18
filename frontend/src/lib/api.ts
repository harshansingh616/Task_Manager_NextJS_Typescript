const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  }
}

export function loadAccessTokenFromStorage() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("accessToken");
  accessToken = token;
}

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

async function refresh(): Promise<string | null> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include", 
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { accessToken: string };
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
  retry = true
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  if (!(options.body instanceof FormData)) {
    if (!headers["Content-Type"] && options.body) headers["Content-Type"] = "application/json";
  }

  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", 
  });

  if (res.status === 401 && retry) {
    const newToken = await refresh();
    if (newToken) return apiFetch<T>(path, options, false);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.message ?? "Request failed";
    throw new Error(message);
  }

  return data as T;
}