export const ROLES = ["applicant", "member", "interviewer", "admin"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function hasMinRole(role: Role, minimum: Role) {
  const rank: Record<Role, number> = {
    applicant: 1,
    member: 2,
    interviewer: 3,
    admin: 4,
  };
  return rank[role] >= rank[minimum];
}

export function canAccessAdmin(role: Role | null | undefined) {
  return role === "admin";
}
