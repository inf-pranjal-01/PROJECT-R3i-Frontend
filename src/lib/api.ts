const DEFAULT_API_BASE = "https://project-r3i.onrender.com";
const API_BASE = (import.meta.env.VITE_API_BASE || DEFAULT_API_BASE).replace(/\/+$/, "");

async function parseResponseBody(res: Response) {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(data: unknown, status: number) {
  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    const errorData = data as { detail?: unknown; error?: unknown; message?: unknown };

    if (errorData.detail) {
      return typeof errorData.detail === "string"
        ? errorData.detail
        : JSON.stringify(errorData.detail);
    }

    if (typeof errorData.error === "string" && errorData.error.trim()) return errorData.error;
    if (typeof errorData.message === "string" && errorData.message.trim()) return errorData.message;
  }

  return `HTTP ${status}`;
}

function throwIfBackendReturnedError(data: unknown) {
  if (data && typeof data === "object" && "error" in data) {
    const error = (data as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) {
      throw new Error(error);
    }
  }

  return data;
}

export async function apiPost<T = any>(path: string, body: any, timeoutMs = 60000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await parseResponseBody(res);
    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status));
    }
    return throwIfBackendReturnedError(data) as T;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new Error("Request timed out. The server may be waking up — please try again.");
    }
    throw err;
  }
}

export async function apiGet<T = any>(path: string, timeoutMs = 60000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(API_BASE + path, { signal: controller.signal });
    clearTimeout(timer);
    const data = await parseResponseBody(res);
    if (!res.ok) {
      throw new Error(getErrorMessage(data, res.status));
    }
    return throwIfBackendReturnedError(data) as T;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new Error("Request timed out. The server may be waking up — please try again.");
    }
    throw err;
  }
}
