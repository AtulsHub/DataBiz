import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const base = "http://localhost:3000";
const sql = neon(process.env.DATABASE_URL);

const signIn = await fetch(`${base}/api/auth/sign-in/magic-link`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    origin: base,
    referer: `${base}/login`,
  },
  body: JSON.stringify({
    email: "26230051126@stu.manit.ac.in",
    callbackURL: "/account",
    newUserCallbackURL: "/account",
    errorCallbackURL: "/login?error=link",
  }),
});

console.log("sign-in", signIn.status, await signIn.text());

const [row] = await sql`
  select identifier
  from verification
  where identifier like 'magic-link:%'
  order by created_at desc
  limit 1
`;

if (!row) {
  console.error("no verification row");
  process.exit(1);
}

const token = String(row.identifier).replace(/^magic-link:/, "");
const url = `${base}/api/auth/magic-link/verify?token=${encodeURIComponent(token)}&callbackURL=%2Faccount&newUserCallbackURL=%2Faccount&errorCallbackURL=%2Flogin%3Ferror%3Dlink`;
console.log("verify url", url);

const verify = await fetch(url, {
  redirect: "manual",
  headers: {
    origin: base,
    referer: `${base}/login`,
  },
});

console.log("verify status", verify.status);
console.log("location", verify.headers.get("location"));
const setCookies =
  typeof verify.headers.getSetCookie === "function"
    ? verify.headers.getSetCookie()
    : [verify.headers.get("set-cookie")].filter(Boolean);
console.log("set-cookie count", setCookies.length);
for (const c of setCookies) console.log("set-cookie:", c);

if (setCookies.length) {
  const cookieHeader = setCookies
    .map((c) => c.split(";")[0])
    .join("; ");
  const session = await fetch(`${base}/api/auth/get-session`, {
    headers: { cookie: cookieHeader },
  });
  console.log("get-session", session.status, await session.text());
}
