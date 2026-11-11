const apiBaseUrl = (
  process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.2:8000"
).replace(/\/$/, "");

export async function apiRequest<T>(
  path: string,
  token: string | null,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new Error(
      "Unable to reach the server. Check your connection and API URL.",
    );
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.detail ?? `Request failed (${response.status})`);
  }
  return body as T;
}
