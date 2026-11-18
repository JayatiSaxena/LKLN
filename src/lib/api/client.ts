export type ApiClientOptions = {
  baseUrl?: string;
  getAuthToken?: () => string | null | undefined;
};

const DEFAULT_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class ApiClient {
  private baseUrl: string;
  private getAuthToken?: () => string | null | undefined;

  constructor(opts: ApiClientOptions = {}) {
    this.baseUrl = opts.baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? "";
    this.getAuthToken = opts.getAuthToken ?? (() => {
      try {
        return localStorage.getItem("auth:token");
      } catch {
        return null;
      }
    });
  }

  private withTimeout<T>(promise: Promise<T>, ms = DEFAULT_TIMEOUT_MS): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => reject(new Error("Request timed out")), ms);
      promise
        .then((value) => {
          clearTimeout(id);
          resolve(value);
        })
        .catch((err) => {
          clearTimeout(id);
          reject(err);
        });
    });
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    };

    const token = this.getAuthToken?.();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const res = await this.withTimeout(fetch(url, { ...init, headers }));

    if (!res.ok) {
      let data: unknown = undefined;
      try {
        data = await res.json();
      } catch {
        // ignore
      }
      throw new ApiError(`Request failed with status ${res.status}`, res.status, data);
    }

    // try to parse json, fallback to text
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await res.json()) as T;
    }
    return (await res.text()) as unknown as T;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
