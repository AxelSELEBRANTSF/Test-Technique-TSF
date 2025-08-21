// src/lib/utils.ts
export type ApiDateLike =
  | string
  | null
  | undefined
  | { date: string; timezone?: string; timezone_type?: number };

export function readApiDate(d: ApiDateLike): string {
  if (!d) return "";
  if (typeof d === "string") {
    const s = d.includes("T") ? d.split("T")[0] : d.split(" ")[0];
    return s || "";
  }
  const s = d.date || "";
  return s.includes("T") ? s.split("T")[0] : s.split(" ")[0];
}

export function asArray<T>(v: any): T[] {
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.items)) return v.items;
  if (v && Array.isArray(v.results)) return v.results;
  if (v && Array.isArray(v.data)) return v.data;
  if (v && Array.isArray(v["hydra:member"])) return v["hydra:member"];
  return [];
}

export function readUserLabel(u: any): string {
  if (!u) return "";
  if (typeof u === "string" || typeof u === "number") return String(u);
  const email = (u.email || u.mail || "").toString().trim();
  const display = (u.displayName || u.name || u.fullname || "").toString().trim();
  const username = (u.username || u.login || "").toString().trim();
  return display || username || email || (u.id ? `#${u.id}` : "");
}

export type CurrentUser = {
  id?: string | number;
  email?: string;
  displayName?: string;
  roles?: string[] | string;
  role?: string;
  [k: string]: any;
};

export function normRoles(u: CurrentUser | null): string[] {
  let arr: string[] = [];
  if (typeof u?.role === "string" && u.role.trim()) arr = [u.role];
  else if (Array.isArray(u?.roles)) arr = u!.roles!;
  else if (typeof (u as any)?.roles === "string") arr = (u as any).roles.split(/[,\s]+/).filter(Boolean);
  return arr.map(x => String(x).toLowerCase().replace(/^role_/, ""));
}
export const isAdmin  = (u: CurrentUser | null) => normRoles(u).includes("admin") || normRoles(u).includes("administrator");
export const isEditor = (u: CurrentUser | null) => normRoles(u).includes("editor");
export const canEdit = (m: any, u: CurrentUser | null) => {
  if (!u) return false;
  if (isAdmin(u)) return true;

  if (isEditor(u)) {
    const createdByIsAdmin =
      !!m?.created_by_is_admin ||
      (typeof m?.created_by_role === "string" &&
        m.created_by_role.toUpperCase().includes("ADMIN"));

    return !createdByIsAdmin; // éditeur autorisé sauf si film créé par un admin
  }

  return false;
};

export const canDelete = (_m: any, u: CurrentUser | null) => !!u && isAdmin(u);
