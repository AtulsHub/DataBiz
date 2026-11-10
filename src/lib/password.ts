import { and, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { account } from "@/db/schema";

export async function userHasCredentialPassword(
  userId: string,
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  const db = getDb();
  if (!db) return false;

  const rows = await db
    .select({
      id: account.id,
      password: account.password,
    })
    .from(account)
    .where(
      and(eq(account.userId, userId), eq(account.providerId, "credential")),
    )
    .limit(1);

  return Boolean(rows[0]?.password);
}
