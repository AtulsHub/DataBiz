import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const base = "http://localhost:3000";
const jar = new Map();
const sql = neon(process.env.DATABASE_URL);

async function req(url, opts = {}) {
  const headers = new Headers(opts.headers || {});
  headers.set("origin", base);
  if (jar.size) {
    headers.set(
      "cookie",
      [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; "),
    );
  }
  const response = await fetch(url, { ...opts, headers, redirect: "manual" });
  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];
  for (const raw of setCookies) {
    const [pair] = raw.split(";");
    const i = pair.indexOf("=");
    jar.set(pair.slice(0, i), pair.slice(i + 1));
  }
  return response;
}

await req(`${base}/api/auth/sign-in/magic-link`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    email: "26230051126@stu.manit.ac.in",
    callbackURL: "/account",
  }),
});

const [row] = await sql`
  select identifier
  from verification
  where identifier like 'magic-link:%'
  order by created_at desc
  limit 1
`;
const token = String(row.identifier).replace(/^magic-link:/, "");

let url = `${base}/api/auth/magic-link/verify?token=${token}&callbackURL=%2Faccount`;
for (let i = 0; i < 4; i++) {
  const response = await req(url);
  console.log({
    step: i,
    status: response.status,
    location: response.headers.get("location"),
    cookies: [...jar.keys()],
  });
  if (response.status >= 300 && response.status < 400) {
    url = new URL(response.headers.get("location"), base).toString();
    continue;
  }
  const html = await response.text();
  console.log({
    signedOutCopy: html.includes("You're not signed in"),
    accountCopy: html.includes("Your account") || html.includes("26230051126"),
    htmlSnippet: html.slice(0, 400),
  });
  break;
}

const session = await req(`${base}/api/auth/get-session`);
console.log("get-session", await session.text());
