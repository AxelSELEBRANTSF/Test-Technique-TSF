// Front-end/MovieApp/src/types.ts
export type ApiDate = string | null | undefined;
export type Role = "reader" | "editor" | "admin";

export interface CurrentUser {
  id: number | string;
  email: string;
  displayName?: string;
  role?: Role;          // côté back, parfois role unique
  roles?: string[];     // côté front, parfois tableau
  isAdmin?: boolean;
}

export interface Movie {
  id: number;
  title: string;
  production?: string | null;
  director?: string | null;
  start_date?: ApiDate;
  end_date?: ApiDate;
  created_at?: ApiDate;
  updated_at?: ApiDate;
  created_by?: string | { id:number; email?:string; displayName?:string; username?:string } | null;
  updated_by?: string | { id:number; email?:string; displayName?:string; username?:string } | null;
  created_by_id?: number | null;
  created_by_role?: Role | null;
  created_by_is_admin?: boolean;
}

export interface MovieDraft {
  title: string;
  production?: string | null;
  director?: string | null;
  start_date?: string | null; // yyyy-mm-dd
  end_date?: string | null;   // yyyy-mm-dd
}

export interface LogRow {
  id: number;
  user_id?: number | string | null;
  user_email?: string | null;
  user_display?: string | null;
  action?: string | null;
  entity?: string | null;
  entity_id?: number | string | null;
  message?: string | null;
  created_at: string; // ISO
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SuggestResponse {
  items: string[];
}

export interface AdminUser {
  id: number | string;
  email?: string;
  displayName?: string | null;
  username?: string | null;
  role: Role;
  created_at?: string | null;
}
