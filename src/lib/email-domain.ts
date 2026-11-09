const DEFAULT_DOMAIN = "stu.manit.ac.in";

export function allowedEmailDomain() {
  return (
    process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase() || DEFAULT_DOMAIN
  );
}

/**
 * College magic-link rules (SPEC §4.1):
 * - one @
 * - domain matches ALLOWED_EMAIL_DOMAIN (case-insensitive)
 * - local part non-empty and contains no +
 */
export function isAllowedCollegeEmail(email: string) {
  const value = email.trim().toLowerCase();
  const at = value.indexOf("@");
  if (at <= 0 || at !== value.lastIndexOf("@")) return false;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (!local || local.includes("+")) return false;
  return domain === allowedEmailDomain();
}

export function rollNumberFromEmail(email: string) {
  return email.trim().toLowerCase().split("@")[0] ?? "";
}
