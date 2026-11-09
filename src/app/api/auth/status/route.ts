import { isAuthConfigured } from "@/lib/auth";
import { isDatabaseConfigured } from "@/db";
import { isEmailConfigured } from "@/lib/email";
import { allowedEmailDomain } from "@/lib/email-domain";

export async function GET() {
  return Response.json({
    configured: isAuthConfigured(),
    database: isDatabaseConfigured(),
    secret: Boolean(process.env.BETTER_AUTH_SECRET?.trim()),
    email: isEmailConfigured(),
    domain: allowedEmailDomain(),
  });
}
