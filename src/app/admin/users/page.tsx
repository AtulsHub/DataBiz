import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { desc } from "drizzle-orm";
import { Container } from "@/components/ui/Container";
import { getDb, isDatabaseConfigured } from "@/db";
import { user } from "@/db/schema";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Users" };

async function UsersTable() {
  await connection();

  if (!isDatabaseConfigured()) {
    return (
      <p className="mt-8 text-sm text-mute">
        Connect Neon to list accounts and roles.
      </p>
    );
  }

  const db = getDb()!;
  const rows = await db.select().from(user).orderBy(desc(user.createdAt));

  if (rows.length === 0) {
    return <p className="mt-8 text-sm text-mute">No users yet.</p>;
  }

  return (
    <div className="mt-10 overflow-x-auto border border-line">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-line bg-paper-elevated font-mono text-[0.65rem] uppercase tracking-[0.14em] text-steel">
          <tr>
            <th className="px-3 py-2 font-medium">Email</th>
            <th className="px-3 py-2 font-medium">Roll</th>
            <th className="px-3 py-2 font-medium">Role</th>
            <th className="px-3 py-2 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-3 py-3">{row.email}</td>
              <td className="px-3 py-3 font-mono text-xs">
                {row.rollNumber ?? "—"}
              </td>
              <td className="px-3 py-3 capitalize">{row.role}</td>
              <td className="px-3 py-3 text-mute">
                {formatDateTime(row.createdAt.toISOString())}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Users
      </h1>
      <p className="mt-3 max-w-xl text-mute">
        Role changes from this screen ship next. Your admin account is already
        set in the database.
      </p>
      <Suspense fallback={<p className="mt-8 text-sm text-mute">Loading users…</p>}>
        <UsersTable />
      </Suspense>
    </Container>
  );
}
