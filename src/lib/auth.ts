import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { getDb, isDatabaseConfigured } from "@/db";
import * as schema from "@/db/schema";
import { sendTransactionalEmail } from "@/lib/email";
import {
  isAllowedCollegeEmail,
  rollNumberFromEmail,
} from "@/lib/email-domain";

export function isAuthConfigured() {
  return Boolean(
    isDatabaseConfigured() &&
      process.env.BETTER_AUTH_SECRET?.trim() &&
      (process.env.BETTER_AUTH_URL?.trim() ||
        process.env.NEXT_PUBLIC_APP_URL?.trim()),
  );
}

function resolveBaseUrl() {
  const explicit =
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return vercel.startsWith("http") ? vercel.replace(/\/$/, "") : `https://${vercel}`;
  }

  return "http://localhost:3000";
}

function resolveTrustedOrigins(baseURL: string) {
  const extras = (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  return Array.from(
    new Set([
      baseURL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://www.databiz.in",
      "https://databiz.in",
      ...extras,
    ]),
  );
}

function createAuth() {
  const db = getDb();
  if (!db) {
    throw new Error("Auth requires DATABASE_URL");
  }

  const baseURL = resolveBaseUrl();

  return betterAuth({
    appName: "DataBiz",
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: resolveTrustedOrigins(baseURL),
    // Stay signed in after the magic-link click — no re-verify until sign-out / expiry.
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // refresh expiry once a day while active
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    // Password for returning users. Public signup stays magic-link only.
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 8,
      sendResetPassword: async ({ user, url }) => {
        if (!isAllowedCollegeEmail(user.email)) {
          throw new Error("Only @stu.manit.ac.in addresses can reset a password.");
        }
        await sendTransactionalEmail({
          to: user.email,
          subject: "Reset your DataBiz password",
          html: `
            <p>Reset your DataBiz password with this link:</p>
            <p><a href="${url}">${url}</a></p>
            <p>It expires in one hour. If you did not request this, ignore the email.</p>
          `,
        });
      },
    },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    user: {
      additionalFields: {
        rollNumber: {
          type: "string",
          required: false,
          input: false,
        },
        year: {
          type: "string",
          required: false,
        },
        branch: {
          type: "string",
          required: false,
        },
        phone: {
          type: "string",
          required: false,
        },
        role: {
          type: "string",
          required: false,
          defaultValue: "applicant",
          input: false,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!isAllowedCollegeEmail(user.email)) {
              throw new Error("Only @stu.manit.ac.in addresses can create accounts.");
            }
            return {
              data: {
                ...user,
                // Magic-link click proves the mailbox; mark verified on create.
                emailVerified: true,
                rollNumber: rollNumberFromEmail(user.email),
                role: "applicant",
              },
            };
          },
        },
      },
    },
    plugins: [
      magicLink({
        expiresIn: 60 * 15,
        disableSignUp: false,
        sendMagicLink: async ({ email, url }) => {
          if (!isAllowedCollegeEmail(email)) {
            throw new Error("Only @stu.manit.ac.in addresses can sign in.");
          }
          await sendTransactionalEmail({
            to: email,
            subject: "Your DataBiz sign-in link",
            html: `
              <p>Sign in to DataBiz with this one-time link:</p>
              <p><a href="${url}">${url}</a></p>
              <p>It expires in 15 minutes. After you open it, you must create a password before using DataBiz. Later logins use email and that password.</p>
              <p>If you did not request this, ignore the email.</p>
            `,
          });
        },
      }),
      nextCookies(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

let authSingleton: Auth | null = null;

export function getAuth(): Auth | null {
  if (!isAuthConfigured()) return null;
  if (!authSingleton) authSingleton = createAuth();
  return authSingleton;
}

export function requireAuth(): Auth {
  const auth = getAuth();
  if (!auth) {
    throw new Error(
      "Auth is not configured. Set DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL.",
    );
  }
  return auth;
}
