import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import {
  isAnnouncementsDbReady,
  listAdminAnnouncements,
} from "@/lib/announcements";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Announcements" };

export default async function AdminAnnouncementsPage() {
  const dbReady = isAnnouncementsDbReady();
  const items = dbReady ? await listAdminAnnouncements() : [];

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Announcements
          </h1>
          <p className="mt-2 max-w-xl text-mute">
            Short official notices on `/announcements`.
          </p>
        </div>
        {dbReady ? (
          <Button href="/admin/announcements/new" variant="ember">
            New announcement
          </Button>
        ) : null}
      </div>
      {!dbReady ? (
        <p className="mt-8 text-sm text-mute">Connect Neon to manage announcements.</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-sm text-mute">No announcements yet.</p>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/admin/announcements/${item.id}`}
                className="grid gap-1 py-5 hover:bg-paper-elevated sm:grid-cols-[1fr_8rem_10rem] sm:items-center"
              >
                <p className="font-medium text-ink">{item.title}</p>
                <p className="font-mono text-xs uppercase text-steel">{item.status}</p>
                <p className="text-sm text-mute">{formatDate(item.publishedAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
