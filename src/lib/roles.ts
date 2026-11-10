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

/** Members and above can open the content desk (/admin). */
export function canAccessDesk(role: Role | null | undefined) {
  return Boolean(role && hasMinRole(role, "member"));
}

/** Only admins can publish, send mail, change roles, or manage sensitive ops. */
export function canPublish(role: Role | null | undefined) {
  return role === "admin";
}

export function canAccessAdmin(role: Role | null | undefined) {
  return role === "admin";
}
