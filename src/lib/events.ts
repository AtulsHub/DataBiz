import { and, asc, count, desc, eq, gt, ne } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { eventRegistrations, events as eventsTable } from "@/db/schema";
import {
  events as seedEvents,
  type EventItem,
  type EventStatus,
} from "@/content/events";
import { mediaUrl } from "@/lib/media";

export type { EventItem, EventStatus };

export type EventRegistration = {
  id: string;
  eventId: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  year: string;
  branch: string;
  status: "registered" | "attended" | "cancelled";
  createdAt: string;
};

function mapRow(row: typeof eventsTable.$inferSelect): EventItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    venue: row.venue ?? "",
    meetingUrl: row.meetingUrl ?? undefined,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    capacity: row.capacity,
    rsvpDeadline: row.rsvpDeadline?.toISOString() ?? undefined,
    status: (row.status as EventStatus) || "draft",
    recapBody: row.recapBody ?? undefined,
    recordingUrl: row.recordingUrl ?? undefined,
    posterUrl: mediaUrl(row.posterPublicId),
    posterPublicId: row.posterPublicId ?? undefined,
    template: (row.template as EventItem["template"]) || "default",
  };
}

function withSeedIds(list: EventItem[]): EventItem[] {
  return list.map((event) => ({
    ...event,
    id: event.id ?? event.slug,
  }));
}

export function isEventsDbReady() {
  return isDatabaseConfigured();
}

export async function listAdminEvents(): Promise<EventItem[]> {
  const db = getDb();
  if (!db) return withSeedIds(seedEvents);

  const rows = await db
    .select()
    .from(eventsTable)
    .orderBy(desc(eventsTable.startsAt));
  return rows.map(mapRow);
}

export async function getAdminEvent(id: string): Promise<EventItem | null> {
  const db = getDb();
  if (!db) {
    return withSeedIds(seedEvents).find((e) => e.id === id || e.slug === id) ?? null;
  }

  const [row] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, id))
    .limit(1);
  return row ? mapRow(row) : null;
}

function seedUpcoming(now: Date) {
  return withSeedIds(seedEvents)
    .filter((e) => e.status === "published" && new Date(e.endsAt) > now)
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
}

function seedPast() {
  return withSeedIds(seedEvents)
    .filter((e) => e.status === "past")
    .sort(
      (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    );
}

export async function getUpcomingEvents(now = new Date()): Promise<EventItem[]> {
  const db = getDb();
  if (!db) return seedUpcoming(now);

  const rows = await db
    .select()
    .from(eventsTable)
    .where(
      and(eq(eventsTable.status, "published"), gt(eventsTable.endsAt, now)),
    )
    .orderBy(asc(eventsTable.startsAt));
  const mapped = rows.map(mapRow);
  return mapped.length > 0 ? mapped : seedUpcoming(now);
}

export async function getPastEvents(): Promise<EventItem[]> {
  const db = getDb();
  if (!db) return seedPast();

  const rows = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.status, "past"))
    .orderBy(desc(eventsTable.startsAt));
  const mapped = rows.map(mapRow);
  return mapped.length > 0 ? mapped : seedPast();
}

export async function getNextEvent(now = new Date()) {
  const upcoming = await getUpcomingEvents(now);
  return upcoming[0] ?? null;
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const seedMatch =
    withSeedIds(seedEvents).find(
      (e) => e.slug === slug && e.status !== "draft",
    ) ?? null;

  const db = getDb();
  if (!db) return seedMatch;

  const [row] = await db
    .select()
    .from(eventsTable)
    .where(and(eq(eventsTable.slug, slug), ne(eventsTable.status, "draft")))
    .limit(1);
  return row ? mapRow(row) : seedMatch;
}

export async function listPublicEventSlugs() {
  const seedSlugs = seedEvents
    .filter((e) => e.status !== "draft")
    .map((e) => e.slug);

  const db = getDb();
  if (!db) return seedSlugs;

  const rows = await db
    .select({ slug: eventsTable.slug })
    .from(eventsTable)
    .where(ne(eventsTable.status, "draft"));
  const dbSlugs = rows.map((r) => r.slug);

  // Cache Components requires generateStaticParams to return at least one path.
  return dbSlugs.length > 0 ? dbSlugs : seedSlugs;
}

export async function countRegistered(eventId: string) {
  const db = getDb();
  if (!db) return 0;

  const [row] = await db
    .select({ value: count() })
    .from(eventRegistrations)
    .where(
      and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.status, "registered"),
      ),
    );
  return row?.value ?? 0;
}

export async function listEventRegistrations(
  eventId: string,
): Promise<EventRegistration[]> {
  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(eventRegistrations)
    .where(eq(eventRegistrations.eventId, eventId))
    .orderBy(desc(eventRegistrations.createdAt));

  return rows.map((row) => ({
    id: row.id,
    eventId: row.eventId,
    userId: row.userId,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    year: row.year,
    branch: row.branch,
    status: row.status as EventRegistration["status"],
    createdAt: row.createdAt.toISOString(),
  }));
}

export function rsvpOpen(
  event: EventItem,
  registeredCount: number,
  now = new Date(),
) {
  if (event.status !== "published") return false;
  if (new Date(event.endsAt) <= now) return false;
  if (event.rsvpDeadline && new Date(event.rsvpDeadline) <= now) return false;
  if (event.capacity != null && registeredCount >= event.capacity) return false;
  return true;
}

export function rsvpClosedReason(
  event: EventItem,
  registeredCount: number,
  now = new Date(),
) {
  if (event.status === "past") return "This session already happened.";
  if (event.status !== "published") return "RSVP is not open.";
  if (new Date(event.endsAt) <= now) return "This event has ended.";
  if (event.rsvpDeadline && new Date(event.rsvpDeadline) <= now) {
    return "The RSVP deadline has passed.";
  }
  if (event.capacity != null && registeredCount >= event.capacity) {
    return "This event is at capacity.";
  }
  return null;
}
