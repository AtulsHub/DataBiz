import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, isAuthConfigured } from "@/lib/auth";

function handlers() {
  if (!isAuthConfigured()) {
    const unavailable = async () =>
      Response.json(
        {
          error:
            "Auth is not configured yet. Set DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL in .env.local.",
        },
        { status: 503 },
      );
    return { GET: unavailable, POST: unavailable };
  }

  const auth = getAuth();
  if (!auth) {
    const unavailable = async () =>
      Response.json({ error: "Auth unavailable" }, { status: 503 });
    return { GET: unavailable, POST: unavailable };
  }

  return toNextJsHandler(auth);
}

export const { GET, POST } = handlers();
