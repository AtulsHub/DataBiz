/** Public origin for links in emails and redirects. */
export function appBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
