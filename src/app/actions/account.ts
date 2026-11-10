"use server";

import { and, desc, eq, ne } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { eventRegistrations, events } from "@/db/schema";
import {
  listApplicationsForUser,
  listSlotsForDrive,
  type ApplicationSummary,
} from "@/lib/applications";
import {
  canTrackPathwayProgress,
  listUserPathwayProgress,
  type PathwayProgressSummary,
} from "@/lib/pathways";
import {
  listResources,
  resourceHref,
  type ResourceItem,
} from "@/lib/resources";
import { hasMinRole } from "@/lib/roles";
import { getSession } from "@/lib/session";

export type MyRegistration = {
  id: string;
  status: string;
  createdAt: string;
  event: {
    id: string;
    slug: string;
    title: string;
    startsAt: string;
    status: string;
  };
};

export async function listMyRegistrations(): Promise<MyRegistration[]> {
  if (!isDatabaseConfigured()) return [];
  const session = await getSession();
  if (!session) return [];

  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select({
      id: eventRegistrations.id,
      status: eventRegistrations.status,
      createdAt: eventRegistrations.createdAt,
      eventId: events.id,
      eventSlug: events.slug,
      eventTitle: events.title,
      eventStartsAt: events.startsAt,
      eventStatus: events.status,
    })
    .from(eventRegistrations)
    .innerJoin(events, eq(eventRegistrations.eventId, events.id))
    .where(
      and(
        eq(eventRegistrations.userId, session.user.id),
        ne(eventRegistrations.status, "cancelled"),
      ),
    )
    .orderBy(desc(eventRegistrations.createdAt));

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    event: {
      id: row.eventId,
      slug: row.eventSlug,
      title: row.eventTitle,
      startsAt: row.eventStartsAt.toISOString(),
      status: row.eventStatus,
    },
  }));
}

export async function listMyPathwayProgress(): Promise<PathwayProgressSummary[]> {
  if (!isDatabaseConfigured()) return [];
  const session = await getSession();
  if (!session || !canTrackPathwayProgress(session.user.role)) return [];
  return listUserPathwayProgress(session.user.id);
}

export type MyApplicationBundle = {
  application: ApplicationSummary;
  slots: Awaited<ReturnType<typeof listSlotsForDrive>>;
};

export async function listMyApplications(): Promise<MyApplicationBundle[]> {
  if (!isDatabaseConfigured()) return [];
  const session = await getSession();
  if (!session) return [];
  const apps = await listApplicationsForUser(session.user.id);
  return Promise.all(
    apps.map(async (application) => ({
      application,
      slots: await listSlotsForDrive(application.drive.id),
    })),
  );
}

export type MyResource = ResourceItem & { href?: string };

export async function listMyResources(): Promise<MyResource[]> {
  if (!isDatabaseConfigured()) return [];
  const session = await getSession();
  if (!session || !hasMinRole(session.user.role, "member")) return [];
  const items = await listResources();
  return items.map((item) => ({
    ...item,
    href: resourceHref(item),
  }));
}
