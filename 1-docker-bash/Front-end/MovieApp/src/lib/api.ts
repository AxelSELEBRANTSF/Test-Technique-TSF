// Front-end/MovieApp/src/lib/api.ts
import {
  CurrentUser, Movie, MovieDraft, Paginated, LogRow, SuggestResponse, AdminUser
} from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers({
    "Content-Type": "application/json",
    ...authHeaders(),
  });

  if (init?.headers) {
    new Headers(init.headers).forEach((v, k) => headers.set(k, v));
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const data = await http<{ token: string; user: CurrentUser }>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  localStorage.setItem("token", data.token);
  return data.user;
}

export async function me() {
  return http<CurrentUser>("/me");
}

export function clearToken() {
  localStorage.removeItem("token");
}

export async function getMovie(id: number) {
  return http<Movie>(`/movies/${id}`);
}

export async function searchMovies(q: string, opts?: { page?: number; pageSize?: number; signal?: AbortSignal }) {
  const page = String(opts?.page ?? 1);
  const pageSize = String(opts?.pageSize ?? 20);
  const params = new URLSearchParams({ q, page, pageSize });
  return http<Paginated<Movie>>(`/movies?${params.toString()}`, { signal: opts?.signal });
}

export async function createMovie(body: MovieDraft) {
  return http<Movie>("/movies", { method: "POST", body: JSON.stringify(body) });
}

export async function updateMovie(id: number, body: Partial<MovieDraft>) {
  return http<Movie>(`/movies/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteMovie(id: number) {
  return http<void>(`/movies/${id}`, { method: "DELETE" });
}

let suggestMoviesController: AbortController | null = null;
export async function suggestMovies(q: string) {
  if (!q || q.trim().length < 2) return [] as string[];
  if (suggestMoviesController) suggestMoviesController.abort();
  suggestMoviesController = new AbortController();
  const params = new URLSearchParams({ q });
  const res = await http<SuggestResponse>(`/movies/suggest?${params.toString()}`, {
    signal: suggestMoviesController.signal
  });
  return res.items;
}

export async function adminListLogs(
  args: { q?: string; page?: number; pageSize?: number },
  init?: { signal?: AbortSignal }
) {
  const params = new URLSearchParams({
    q: args.q ?? "",
    page: String(args.page ?? 1),
    pageSize: String(args.pageSize ?? 20)
  });
  return http<Paginated<LogRow>>(`/admin/logs?${params.toString()}`, { signal: init?.signal });
}

let suggestLogsController: AbortController | null = null;
export async function suggestLogs(q: string) {
  if (!q || q.trim().length < 2) return [] as string[];
  if (suggestLogsController) suggestLogsController.abort();
  suggestLogsController = new AbortController();
  const params = new URLSearchParams({ q });
  const res = await http<SuggestResponse>(`/admin/logs/suggest?${params.toString()}`, {
    signal: suggestLogsController.signal
  });
  return res.items;
}

export async function adminListUsers(
  args: { q?: string; page?: number; pageSize?: number } | string,
  init?: { signal?: AbortSignal }
) {
  let params: URLSearchParams;
  if (typeof args === "string") {
    params = new URLSearchParams({ q: args, page: "1", pageSize: "20" });
  } else {
    params = new URLSearchParams({
      q: args.q ?? "",
      page: String(args.page ?? 1),
      pageSize: String(args.pageSize ?? 20),
    });
  }
  return http<Paginated<AdminUser>>(`/admin/users?${params.toString()}`, { signal: init?.signal });
}

export async function adminUpdateUserRole(id: number | string, role: "reader"|"editor"|"admin") {
  return http<void>(`/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) });
}

export async function adminDeleteUser(id: number | string) {
  return http<void>(`/admin/users/${id}`, { method: "DELETE" });
}

export async function registerUser(email: string, password: string, displayName?: string) {
  return http<void>("/register", { method: "POST", body: JSON.stringify({ email, password, displayName }) });
}
