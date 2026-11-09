import { getAuth, isAuthConfigured } from "@/lib/auth";

async function handler(request: Request) {
  if (!isAuthConfigured()) {
    return Response.json(
      {
        error:
          "Auth is not configured yet. Set DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL in .env.local.",
      },
      { status: 503 },
    );
  }

  const auth = getAuth();
  if (!auth) {
    return Response.json({ error: "Auth unavailable" }, { status: 503 });
  }

  return auth.handler(request);
}

export const GET = handler;
export const POST = handler;
