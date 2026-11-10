import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin-guard";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { isDrivesDbReady, listAdminDrives } from "@/lib/drives";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Drives" };

export default async function AdminDrivesPage() {
  await requireAdminPage();
  const dbReady = isDrivesDbReady();
  const drives = dbReady ? await listAdminDrives() : [];

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Drives
          </h1>
          <p className="mt-2 max-w-xl text-mute">
            Open a recruitment cycle, take applications, run OA, and publish
            results.
          </p>
        </div>
        {dbReady ? (
          <Button href="/admin/drives/new" variant="ember">
            New drive
          </Button>
        ) : null}
      </div>

      {!dbReady ? (
        <p className="mt-8 border border-line bg-paper-elevated px-4 py-3 text-sm text-mute">
          Connect Neon to manage drives.
        </p>
      ) : drives.length === 0 ? (
        <p className="mt-8 text-sm text-mute">No drives yet.</p>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {drives.map((drive) => (
            <li key={drive.id}>
              <Link
                href={`/admin/drives/${drive.id}`}
                className="grid gap-1 py-5 transition-colors hover:bg-paper-elevated sm:grid-cols-[1fr_8rem_12rem] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="font-medium text-ink">{drive.title}</p>
                  <p className="mt-1 font-mono text-xs text-mute">
                    /join/{drive.slug} · {drive.roles.length} roles
                  </p>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel">
                  {drive.status}
                </p>
                <p className="text-sm text-mute">
                  {formatDate(drive.opensAt)} → {formatDate(drive.closesAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
