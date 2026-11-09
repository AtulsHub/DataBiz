import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { drives } from "./content";

export const driveRoles = pgTable("drive_roles", {
  id: text("id").primaryKey(),
  driveId: text("drive_id")
    .notNull()
    .references(() => drives.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  oaMode: text("oa_mode").notNull().default("quiz"),
  oaDeadline: timestamp("oa_deadline", { withTimezone: true }),
  liveStartsAt: timestamp("live_starts_at", { withTimezone: true }),
  liveEndsAt: timestamp("live_ends_at", { withTimezone: true }),
  quizMinutes: integer("quiz_minutes"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey(),
    driveId: text("drive_id")
      .notNull()
      .references(() => drives.id, { onDelete: "restrict" }),
    roleId: text("role_id")
      .notNull()
      .references(() => driveRoles.id, { onDelete: "restrict" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    resumePublicId: text("resume_public_id").notNull(),
    portfolioUrl: text("portfolio_url"),
    stage: text("stage").notNull().default("applied"),
    resultsPublishedAt: timestamp("results_published_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("applications_drive_user_uidx").on(t.driveId, t.userId)],
);

export const oaQuestions = pgTable("oa_questions", {
  id: text("id").primaryKey(),
  roleId: text("role_id")
    .notNull()
    .references(() => driveRoles.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  kind: text("kind").notNull().default("short_text"),
  options: jsonb("options").$type<string[]>().notNull().default([]),
  answerKey: text("answer_key"),
  points: integer("points").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const oaAttempts = pgTable(
  "oa_attempts",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    autoScore: integer("auto_score"),
    manualScore: integer("manual_score"),
    uploadPublicId: text("upload_public_id"),
    status: text("status").notNull().default("in_progress"),
  },
  (t) => [uniqueIndex("oa_attempts_application_uidx").on(t.applicationId)],
);

export const oaAnswers = pgTable(
  "oa_answers",
  {
    id: text("id").primaryKey(),
    attemptId: text("attempt_id")
      .notNull()
      .references(() => oaAttempts.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => oaQuestions.id, { onDelete: "cascade" }),
    response: text("response").notNull().default(""),
    awardedPoints: integer("awarded_points"),
  },
  (t) => [
    uniqueIndex("oa_answers_attempt_question_uidx").on(t.attemptId, t.questionId),
  ],
);

export const interviewSlots = pgTable("interview_slots", {
  id: text("id").primaryKey(),
  driveId: text("drive_id")
    .notNull()
    .references(() => drives.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  capacity: integer("capacity").notNull().default(1),
});

export const interviewBookings = pgTable(
  "interview_bookings",
  {
    id: text("id").primaryKey(),
    slotId: text("slot_id")
      .notNull()
      .references(() => interviewSlots.id, { onDelete: "cascade" }),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("interview_bookings_application_uidx").on(t.applicationId),
  ],
);

export const interviewAssignments = pgTable(
  "interview_assignments",
  {
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    interviewerId: text("interviewer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.applicationId, t.interviewerId] })],
);

export const scorecards = pgTable(
  "scorecards",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    interviewerId: text("interviewer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rubric: jsonb("rubric")
      .$type<{ criterion: string; score: number }[]>()
      .notNull()
      .default([]),
    notes: text("notes").notNull().default(""),
    recommendation: text("recommendation").notNull().default("maybe"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("scorecards_application_interviewer_uidx").on(
      t.applicationId,
      t.interviewerId,
    ),
  ],
);
