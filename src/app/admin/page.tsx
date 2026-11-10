import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  Users,
  Images,
  GraduationCap,
  CalendarDays,
  Handshake,
  Newspaper,
  Mail,
  Megaphone,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { isDatabaseConfigured } from "@/db";
import { countPendingAlumni } from "@/lib/alumni";
import { countOpenDrives } from "@/lib/drives";
import { getUpcomingEvents, isEventsDbReady } from "@/lib/events";
import { listAdminGalleryPhotos } from "@/lib/event-photos";
import { listPendingNewsletterDrafts } from "@/lib/newsletter";
import { canAccessAdmin } from "@/lib/roles";
import { requireDesk } from "@/lib/session";
import { listAdminTeam } from "@/lib/team";

export const metadata: Metadata = {
  title: "Admin",
};

const memberGuides = [
  {
    href: "/admin/events",
    label: "Events & posters",
    body: "Create an event as a draft. An admin publishes it.",
    icon: CalendarDays,
  },
  {
    href: "/admin/gallery",
    label: "Gallery photos",
    body: "Upload photos on draft events before they go live.",
    icon: Images,
  },
  {
    href: "/admin/posts",
    label: "Blog posts",
    body: "Write drafts with covers. Admin approval makes them public.",
    icon: Newspaper,
  },
  {
    href: "/admin/announcements",
    label: "Announcements",
    body: "Draft notices for the core to publish.",
    icon: Megaphone,
  },
  {
    href: "/admin/newsletter",
    label: "Newsletter",
    body: "Compose a draft mail. Only an admin can send it.",
    icon: Mail,
  },
] as const;

const adminGuides = [
  {
    href: "/admin/team",
    label: "Team photos & bios",
    body: "Add core members, roles, and headshots for `/team`.",
    icon: Users,
  },
  {
    href: "/admin/gallery",
    label: "Event gallery",
    body: "Upload photos tied to events. They feed `/gallery`.",
    icon: Images,
  },
  {
    href: "/admin/alumni",
    label: "Alumni profiles",
    body: "Review submissions, add photos, promote to public.",
    icon: GraduationCap,
  },
  {
    href: "/admin/events",
    label: "Events & posters",
    body: "Publish member drafts and attach gallery shots.",
    icon: CalendarDays,
  },
  {
    href: "/admin/sponsors",
    label: "Sponsor logos",
    body: "Upload partner logos and the brochure link.",
    icon: Handshake,
  },
  {
    href: "/admin/posts",
    label: "Blog covers",
    body: "Approve posts and publish covers for `/blog`.",
    icon: Newspaper,
  },
] as const;

async function AdminHomeContent() {
  await connection();
  const session = await requireDesk();
  const isAdmin = canAccessAdmin(session.user.role);
  const upcoming = isEventsDbReady()
    ? await getUpcomingEvents(new Date())
    : [];
  const pendingAlumni = isAdmin ? await countPendingAlumni() : 0;
  const openDrives = isAdmin ? await countOpenDrives() : 0;
  const teamCount =
    isAdmin && isDatabaseConfigured()
      ? (await listAdminTeam()).filter((m) => m.isCurrent).length
      : 0;
  const galleryCount = isDatabaseConfigured()
    ? (await listAdminGalleryPhotos()).length
    : 0;
  const pendingDrafts =
    isAdmin && isDatabaseConfigured()
      ? (await listPendingNewsletterDrafts()).length
      : 0;

  const guides = isAdmin ? adminGuides : memberGuides;

  return (
    <>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Your role",
            value: session.user.role,
            href: undefined as string | undefined,
          },
          {
            label: "Upcoming events",
            value: String(upcoming.length),
            href: "/admin/events",
          },
          {
            label: "Gallery photos",
            value: String(galleryCount),
            href: "/admin/gallery",
          },
          ...(isAdmin
            ? [
                {
                  label: "Pending alumni",
                  value: String(pendingAlumni),
                  href: "/admin/alumni",
                },
                {
                  label: "Open drives",
                  value: String(openDrives),
                  href: "/admin/drives",
                },
                {
                  label: "Newsletter drafts",
                  value: String(pendingDrafts),
                  href: "/admin/newsletter",
                },
              ]
            : []),
        ].map((card) => {
          const inner = (
            <>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mute">
                {card.label}
              </p>
              <p className="mt-3 font-display text-2xl font-semibold tracking-tight capitalize">
                {card.value}
              </p>
            </>
          );
          return card.href ? (
            <Link
              key={card.label}
              href={card.href}
              className="border border-line bg-paper-elevated px-5 py-5 transition-colors hover:border-ember/40"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={card.label}
              className="border border-line bg-paper-elevated px-5 py-5"
            >
              {inner}
            </div>
          );
        })}
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {isAdmin ? "Where you upload & approve" : "What you can create"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-mute">
          {isAdmin
            ? `Members submit drafts. You publish the final version. Current team size: ${teamCount}.`
            : "Save drafts and uploads here. An admin must approve before anything goes public or gets mailed."}
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {guides.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-full gap-4 border border-line bg-paper-elevated p-5 transition-colors hover:border-ember/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-paper text-ember">
                    <Icon size={18} aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium text-ink">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm text-mute">
                      {item.body}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

export default function AdminHomePage() {
  return (
    <Container className="py-10 sm:py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Semester desk
      </h1>
      <p className="mt-3 max-w-2xl text-mute leading-relaxed">
        Members create and upload. Admins approve, publish, and send.
      </p>
      <Suspense
        fallback={
          <p className="mt-10 text-sm text-mute">Loading desk counts…</p>
        }
      >
        <AdminHomeContent />
      </Suspense>
    </Container>
  );
}
