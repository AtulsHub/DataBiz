import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { isAlumniDbReady, listAdminAlumni } from "@/lib/alumni";

export const metadata: Metadata = { title: "Admin · Alumni" };

export default async function AdminAlumniPage() {
  const dbReady = isAlumniDbReady();
  const rows = dbReady ? await listAdminAlumni() : [];

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Alumni
      </h1>
      <p className="mt-2 max-w-xl text-mute">
        Approve pending updates from the public form, then publish to `/alumni`.
      </p>

      {!dbReady ? (
        <p className="mt-8 border border-line bg-paper-elevated px-4 py-3 text-sm text-mute">
          Connect Neon to review alumni submissions.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-sm text-mute">No alumni rows yet.</p>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/admin/alumni/${row.id}`}
                className="grid gap-1 py-5 transition-colors hover:bg-paper-elevated sm:grid-cols-[1fr_8rem_6rem] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="font-medium text-ink">{row.name}</p>
                  <p className="mt-1 text-sm text-mute">
                    {row.organization}
                    {row.currentTitle ? ` · ${row.currentTitle}` : ""}
                  </p>
                </div>
                <p className="font-mono text-xs text-steel">{row.batch}</p>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel">
                  {row.status}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
