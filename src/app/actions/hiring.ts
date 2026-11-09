"use server";

import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionResult } from "@/app/actions/events";
import { getDb, isDatabaseConfigured } from "@/db";
import { drives, user } from "@/db/schema";
import {
  applications,
  driveRoles,
  interviewAssignments,
  interviewBookings,
  interviewSlots,
  oaAnswers,
  oaAttempts,
  oaQuestions,
  scorecards,
} from "@/db/schema/hiring";
import {
  applicantVisibleStage,
  canBookInterview,
  canTakeOa,
  listDriveApplications,
  requireMemberProfile,
  type ApplicationStage,
} from "@/lib/applications";
import {
  isDriveAcceptingApplications,
  type OaMode,
} from "@/lib/drives";
import { fromDatetimeLocalValue } from "@/lib/datetime";
import { sendTransactionalEmail } from "@/lib/email";
import { canAccessAdmin } from "@/lib/roles";
import { getSession, requireAdmin, requireSession } from "@/lib/session";
import { slugify } from "@/lib/slug";

function requireHiringDb(): ActionResult | null {
  if (!isDatabaseConfigured() || !getDb()) {
    return {
      ok: false,
      error:
        "DATABASE_URL is not set. Add Neon credentials to .env.local and run pnpm db:push.",
    };
  }
  return null;
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

async function uniqueDriveSlug(base: string, excludeId?: string) {
  const db = getDb()!;
  let candidate = slugify(base) || `drive-${Date.now()}`;
  let attempt = 0;
  while (attempt < 20) {
    const [existing] = await db
      .select({ id: drives.id })
      .from(drives)
      .where(eq(drives.slug, candidate))
      .limit(1);
    if (!existing || existing.id === excludeId) return candidate;
    attempt += 1;
    candidate = `${slugify(base) || "drive"}-${attempt + 1}`;
  }
  return `${candidate}-${crypto.randomUUID().slice(0, 8)}`;
}

function revalidateDrive(slug: string, driveId?: string) {
  revalidatePath("/join");
  revalidatePath(`/join/${slug}`);
  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/admin/drives");
  if (driveId) revalidatePath(`/admin/drives/${driveId}`);
  revalidatePath("/interviews");
}

const roleInput = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1),
  description: z.string().trim().default(""),
  oaMode: z.enum(["quiz", "upload", "quiz_and_upload", "live_quiz"]),
  oaDeadline: z.string().optional(),
  liveStartsAt: z.string().optional(),
  liveEndsAt: z.string().optional(),
  quizMinutes: z.coerce.number().int().positive().optional().nullable(),
});

export async function createDrive(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireHiringDb();
  if (blocked) return blocked;

  const title = formString(formData, "title").trim();
  const opensAt = fromDatetimeLocalValue(formString(formData, "opensAt"));
  const closesAt = fromDatetimeLocalValue(formString(formData, "closesAt"));
  if (!title) return { ok: false, error: "Title is required." };
  if (!opensAt || !closesAt) {
    return { ok: false, error: "Open and close times are required." };
  }
  if (closesAt <= opensAt) {
    return { ok: false, error: "Close time must be after open time." };
  }

  let id: string;
  let slug: string;
  try {
    const db = getDb()!;
    slug = await uniqueDriveSlug(formString(formData, "slug") || title);
    id = crypto.randomUUID();
    await db.insert(drives).values({
      id,
      slug,
      title,
      description: formString(formData, "description"),
      opensAt,
      closesAt,
      status: (formString(formData, "status") as "draft" | "open" | "closed") || "draft",
    });
    revalidateDrive(slug, id);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not create drive.",
    };
  }
  redirect(`/admin/drives/${id}`);
}

export async function updateDrive(
  driveId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireHiringDb();
  if (blocked) return blocked;

  const title = formString(formData, "title").trim();
  const opensAt = fromDatetimeLocalValue(formString(formData, "opensAt"));
  const closesAt = fromDatetimeLocalValue(formString(formData, "closesAt"));
  if (!title || !opensAt || !closesAt) {
    return { ok: false, error: "Title and window are required." };
  }
  if (closesAt <= opensAt) {
    return { ok: false, error: "Close time must be after open time." };
  }

  try {
    const db = getDb()!;
    const [existing] = await db
      .select()
      .from(drives)
      .where(eq(drives.id, driveId))
      .limit(1);
    if (!existing) return { ok: false, error: "Drive not found." };

    const requested = formString(formData, "slug").trim();
    const slug =
      requested && requested !== existing.slug
        ? await uniqueDriveSlug(requested, driveId)
        : existing.slug;

    await db
      .update(drives)
      .set({
        title,
        slug,
        description: formString(formData, "description"),
        opensAt,
        closesAt,
        status:
          (formString(formData, "status") as "draft" | "open" | "closed") ||
          existing.status,
      })
      .where(eq(drives.id, driveId));

    revalidateDrive(slug, driveId);
    if (existing.slug !== slug) revalidatePath(`/join/${existing.slug}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not update drive.",
    };
  }
}

export async function saveDriveRoles(
  driveId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireHiringDb();
  if (blocked) return blocked;

  let rolesRaw: unknown;
  try {
    rolesRaw = JSON.parse(formString(formData, "rolesJson") || "[]");
  } catch {
    return { ok: false, error: "Roles payload is invalid." };
  }

  const parsed = z.array(roleInput).safeParse(rolesRaw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Fix role fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const db = getDb()!;
    const [drive] = await db
      .select()
      .from(drives)
      .where(eq(drives.id, driveId))
      .limit(1);
    if (!drive) return { ok: false, error: "Drive not found." };

    const existing = await db
      .select({ id: driveRoles.id })
      .from(driveRoles)
      .where(eq(driveRoles.driveId, driveId));
    const keep = new Set(
      parsed.data.map((r) => r.id).filter((id): id is string => Boolean(id)),
    );

    for (const row of existing) {
      if (!keep.has(row.id)) {
        await db.delete(driveRoles).where(eq(driveRoles.id, row.id));
      }
    }

    for (const [index, role] of parsed.data.entries()) {
      const values = {
        name: role.name,
        description: role.description,
        oaMode: role.oaMode as OaMode,
        oaDeadline: role.oaDeadline
          ? fromDatetimeLocalValue(role.oaDeadline)
          : null,
        liveStartsAt: role.liveStartsAt
          ? fromDatetimeLocalValue(role.liveStartsAt)
          : null,
        liveEndsAt: role.liveEndsAt
          ? fromDatetimeLocalValue(role.liveEndsAt)
          : null,
        quizMinutes: role.quizMinutes ?? null,
        sortOrder: index + 1,
      };

      if (role.id && keep.has(role.id)) {
        await db
          .update(driveRoles)
          .set(values)
          .where(
            and(eq(driveRoles.id, role.id), eq(driveRoles.driveId, driveId)),
          );
      } else {
        await db.insert(driveRoles).values({
          id: crypto.randomUUID(),
          driveId,
          ...values,
        });
      }
    }

    revalidateDrive(drive.slug, driveId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not save roles.",
    };
  }
}

export async function saveRoleQuestions(
  roleId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireHiringDb();
  if (blocked) return blocked;

  let questionsRaw: unknown;
  try {
    questionsRaw = JSON.parse(formString(formData, "questionsJson") || "[]");
  } catch {
    return { ok: false, error: "Questions payload is invalid." };
  }

  const schema = z.array(
    z.object({
      id: z.string().optional(),
      prompt: z.string().trim().min(1),
      kind: z.enum(["multiple_choice", "short_text", "long_text"]),
      options: z.array(z.string()).default([]),
      answerKey: z.string().optional(),
      points: z.coerce.number().int().positive().default(1),
    }),
  );
  const parsed = schema.safeParse(questionsRaw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Fix question fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const db = getDb()!;
    const [role] = await db
      .select()
      .from(driveRoles)
      .where(eq(driveRoles.id, roleId))
      .limit(1);
    if (!role) return { ok: false, error: "Role not found." };
    const [drive] = await db
      .select()
      .from(drives)
      .where(eq(drives.id, role.driveId))
      .limit(1);

    const existing = await db
      .select({ id: oaQuestions.id })
      .from(oaQuestions)
      .where(eq(oaQuestions.roleId, roleId));
    const keep = new Set(
      parsed.data.map((q) => q.id).filter((id): id is string => Boolean(id)),
    );
    for (const row of existing) {
      if (!keep.has(row.id)) {
        await db.delete(oaQuestions).where(eq(oaQuestions.id, row.id));
      }
    }

    for (const [index, q] of parsed.data.entries()) {
      const values = {
        prompt: q.prompt,
        kind: q.kind,
        options: q.options,
        answerKey: q.answerKey?.trim() || null,
        points: q.points,
        sortOrder: index + 1,
      };
      if (q.id && keep.has(q.id)) {
        await db
          .update(oaQuestions)
          .set(values)
          .where(and(eq(oaQuestions.id, q.id), eq(oaQuestions.roleId, roleId)));
      } else {
        await db.insert(oaQuestions).values({
          id: crypto.randomUUID(),
          roleId,
          ...values,
        });
      }
    }

    if (drive) revalidateDrive(drive.slug, drive.id);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not save questions.",
    };
  }
}

export async function applyToDrive(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const blocked = requireHiringDb();
  if (blocked) return blocked;

  const session = await requireSession("/join");
  const profileError = requireMemberProfile(session.user);
  if (profileError) return { ok: false, error: profileError };

  const driveId = formString(formData, "driveId");
  const roleId = formString(formData, "roleId");
  const resumePublicId = formString(formData, "resumePublicId").trim();
  const portfolioUrl =
    formString(formData, "portfolioUrl").trim() || undefined;

  if (!driveId || !roleId) {
    return { ok: false, error: "Pick a role to apply." };
  }
  if (!resumePublicId) {
    return { ok: false, error: "Upload a resume PDF before submitting." };
  }

  try {
    const db = getDb()!;
    const [drive] = await db
      .select()
      .from(drives)
      .where(eq(drives.id, driveId))
      .limit(1);
    if (!drive) return { ok: false, error: "Drive not found." };
    if (
      !isDriveAcceptingApplications({
        status: drive.status as "draft" | "open" | "closed",
        opensAt: drive.opensAt.toISOString(),
        closesAt: drive.closesAt.toISOString(),
      })
    ) {
      return { ok: false, error: "This drive is not accepting applications." };
    }

    const [role] = await db
      .select()
      .from(driveRoles)
      .where(and(eq(driveRoles.id, roleId), eq(driveRoles.driveId, driveId)))
      .limit(1);
    if (!role) return { ok: false, error: "That role is not on this drive." };

    const [existing] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(
        and(
          eq(applications.driveId, driveId),
          eq(applications.userId, session.user.id),
        ),
      )
      .limit(1);
    if (existing) {
      return { ok: false, error: "You already applied to this drive." };
    }

    const id = crypto.randomUUID();
    await db.insert(applications).values({
      id,
      driveId,
      roleId,
      userId: session.user.id,
      resumePublicId,
      portfolioUrl: portfolioUrl || null,
      stage: "applied",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await sendTransactionalEmail({
      to: session.user.email,
      subject: `Application received · ${drive.title}`,
      html: `<p>Hi ${session.user.name || "there"},</p><p>We received your application for <strong>${role.name}</strong> on <strong>${drive.title}</strong>. Track your stage on your account page.</p>`,
    });

    revalidateDrive(drive.slug, drive.id);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not submit application.",
    };
  }
}

async function emailStageChange(
  to: string,
  name: string,
  driveTitle: string,
  stage: ApplicationStage,
) {
  const subjects: Partial<Record<ApplicationStage, string>> = {
    oa: `Online assessment · ${driveTitle}`,
    shortlisted: `Shortlisted · ${driveTitle}`,
    interview: `Interview · ${driveTitle}`,
    selected: `Selected · ${driveTitle}`,
    waitlisted: `Waitlisted · ${driveTitle}`,
    rejected: `Application update · ${driveTitle}`,
  };
  const subject = subjects[stage];
  if (!subject) return;

  await sendTransactionalEmail({
    to,
    subject,
    html: `<p>Hi ${name || "there"},</p><p>Your application for <strong>${driveTitle}</strong> is now at stage <strong>${stage}</strong>. Open your account page for deadlines and next steps.</p>`,
  });
}

export async function moveApplicationStage(
  applicationId: string,
  stage: ApplicationStage,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireHiringDb();
  if (blocked) return blocked;

  try {
    const db = getDb()!;
    const [row] = await db
      .select({
        application: applications,
        drive: drives,
        applicant: user,
      })
      .from(applications)
      .innerJoin(drives, eq(applications.driveId, drives.id))
      .innerJoin(user, eq(applications.userId, user.id))
      .where(eq(applications.id, applicationId))
      .limit(1);
    if (!row) return { ok: false, error: "Application not found." };

    await db
      .update(applications)
      .set({ stage, updatedAt: new Date() })
      .where(eq(applications.id, applicationId));

    const published = Boolean(
      row.application.resultsPublishedAt || row.drive.resultsPublishedAt,
    );

    if (stage === "oa" || stage === "shortlisted" || stage === "interview") {
      await emailStageChange(
        row.applicant.email,
        row.applicant.name,
        row.drive.title,
        stage,
      );
    } else if (stage === "rejected" && !published) {
      // early reject at shortlist
      await emailStageChange(
        row.applicant.email,
        row.applicant.name,
        row.drive.title,
        stage,
      );
    } else if (
      (stage === "selected" ||
        stage === "waitlisted" ||
        stage === "rejected") &&
      published
    ) {
      await emailStageChange(
        row.applicant.email,
        row.applicant.name,
        row.drive.title,
        stage,
      );
    }

    revalidateDrive(row.drive.slug, row.drive.id);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not update stage.",
    };
  }
}

export async function publishDriveResults(
  driveId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireHiringDb();
  if (blocked) return blocked;

  try {
    const db = getDb()!;
    const [drive] = await db
      .select()
      .from(drives)
      .where(eq(drives.id, driveId))
      .limit(1);
    if (!drive) return { ok: false, error: "Drive not found." };

    const now = new Date();
    await db
      .update(drives)
      .set({ resultsPublishedAt: now })
      .where(eq(drives.id, driveId));
    await db
      .update(applications)
      .set({ resultsPublishedAt: now, updatedAt: now })
      .where(eq(applications.driveId, driveId));

    const apps = await listDriveApplications(driveId);
    for (const app of apps) {
      if (
        app.stage === "selected" ||
        app.stage === "waitlisted" ||
        app.stage === "rejected"
      ) {
        await emailStageChange(
          app.user.email,
          app.user.name,
          drive.title,
          app.stage,
        );
      }
    }

    revalidateDrive(drive.slug, drive.id);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not publish results.",
    };
  }
}

export async function startOaAttempt(
  applicationId: string,
): Promise<ActionResult & { attemptId?: string; endsAt?: string }> {
  const blocked = requireHiringDb();
  if (blocked) return blocked;
  const session = await requireSession("/account");

  try {
    const db = getDb()!;
    const [row] = await db
      .select({
        application: applications,
        role: driveRoles,
        drive: drives,
      })
      .from(applications)
      .innerJoin(driveRoles, eq(applications.roleId, driveRoles.id))
      .innerJoin(drives, eq(applications.driveId, drives.id))
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.userId, session.user.id),
        ),
      )
      .limit(1);
    if (!row) return { ok: false, error: "Application not found." };
    if (!canTakeOa(row.application.stage as ApplicationStage)) {
      return { ok: false, error: "Your OA is not open yet." };
    }

    const now = new Date();
    if (row.role.oaMode === "live_quiz") {
      if (!row.role.liveStartsAt || now < row.role.liveStartsAt) {
        return { ok: false, error: "The live quiz has not started." };
      }
      if (row.role.liveEndsAt && now > row.role.liveEndsAt) {
        return { ok: false, error: "The live quiz window has closed." };
      }
    } else if (row.role.oaDeadline && now > row.role.oaDeadline) {
      return { ok: false, error: "The OA deadline has passed." };
    }

    const [existing] = await db
      .select()
      .from(oaAttempts)
      .where(eq(oaAttempts.applicationId, applicationId))
      .limit(1);
    if (existing) {
      if (existing.status === "submitted") {
        return { ok: false, error: "You already submitted this OA." };
      }
      const endsAt = computeAttemptEndsAt(
        existing.startedAt,
        row.role.quizMinutes,
        row.role.oaDeadline,
        row.role.liveEndsAt,
        row.role.oaMode as OaMode,
      );
      return { ok: true, attemptId: existing.id, endsAt: endsAt?.toISOString() };
    }

    const id = crypto.randomUUID();
    const startedAt = now;
    await db.insert(oaAttempts).values({
      id,
      applicationId,
      startedAt,
      status: "in_progress",
    });

    const endsAt = computeAttemptEndsAt(
      startedAt,
      row.role.quizMinutes,
      row.role.oaDeadline,
      row.role.liveEndsAt,
      row.role.oaMode as OaMode,
    );

    revalidateDrive(row.drive.slug, row.drive.id);
    return { ok: true, attemptId: id, endsAt: endsAt?.toISOString() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not start OA.",
    };
  }
}

function computeAttemptEndsAt(
  startedAt: Date,
  quizMinutes: number | null | undefined,
  oaDeadline: Date | null | undefined,
  liveEndsAt: Date | null | undefined,
  mode: OaMode,
) {
  const candidates: Date[] = [];
  if (mode === "live_quiz" && liveEndsAt) candidates.push(liveEndsAt);
  if (quizMinutes && quizMinutes > 0) {
    candidates.push(new Date(startedAt.getTime() + quizMinutes * 60_000));
  }
  if (oaDeadline) candidates.push(oaDeadline);
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => (a < b ? a : b));
}

export async function submitOaAttempt(
  attemptId: string,
  answersJson: string,
  uploadPublicId?: string,
): Promise<ActionResult> {
  const blocked = requireHiringDb();
  if (blocked) return blocked;
  const session = await requireSession("/account");

  let answers: { questionId: string; response: string }[] = [];
  try {
    answers = z
      .array(
        z.object({
          questionId: z.string(),
          response: z.string(),
        }),
      )
      .parse(JSON.parse(answersJson || "[]"));
  } catch {
    return { ok: false, error: "Answers payload is invalid." };
  }

  try {
    const db = getDb()!;
    const [row] = await db
      .select({
        attempt: oaAttempts,
        application: applications,
        role: driveRoles,
        drive: drives,
      })
      .from(oaAttempts)
      .innerJoin(applications, eq(oaAttempts.applicationId, applications.id))
      .innerJoin(driveRoles, eq(applications.roleId, driveRoles.id))
      .innerJoin(drives, eq(applications.driveId, drives.id))
      .where(eq(oaAttempts.id, attemptId))
      .limit(1);

    if (!row || row.application.userId !== session.user.id) {
      return { ok: false, error: "Attempt not found." };
    }
    if (row.attempt.status === "submitted") {
      return { ok: false, error: "Already submitted." };
    }

    const now = new Date();
    if (row.role.oaMode === "live_quiz" && row.role.liveEndsAt && now > row.role.liveEndsAt) {
      return { ok: false, error: "The live quiz window has closed." };
    }

    const questions = await db
      .select()
      .from(oaQuestions)
      .where(eq(oaQuestions.roleId, row.role.id));

    await db.delete(oaAnswers).where(eq(oaAnswers.attemptId, attemptId));

    let autoScore = 0;
    for (const q of questions) {
      const answer = answers.find((a) => a.questionId === q.id);
      const response = answer?.response ?? "";
      let awarded: number | null = null;
      if (q.kind === "multiple_choice" && q.answerKey) {
        awarded =
          response.trim().toLowerCase() === q.answerKey.trim().toLowerCase()
            ? q.points
            : 0;
        autoScore += awarded;
      }
      await db.insert(oaAnswers).values({
        id: crypto.randomUUID(),
        attemptId,
        questionId: q.id,
        response,
        awardedPoints: awarded,
      });
    }

    const needsUpload =
      row.role.oaMode === "upload" || row.role.oaMode === "quiz_and_upload";
    const uploadId =
      uploadPublicId?.trim() ||
      (needsUpload ? row.application.resumePublicId : null);

    await db
      .update(oaAttempts)
      .set({
        status: "submitted",
        submittedAt: now,
        autoScore,
        uploadPublicId: uploadId,
      })
      .where(eq(oaAttempts.id, attemptId));

    revalidateDrive(row.drive.slug, row.drive.id);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not submit OA.",
    };
  }
}

export async function setManualScore(
  attemptId: string,
  manualScore: number,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireHiringDb();
  if (blocked) return blocked;
  if (!Number.isFinite(manualScore) || manualScore < 0) {
    return { ok: false, error: "Manual score must be a non-negative number." };
  }

  try {
    const db = getDb()!;
    const [row] = await db
      .select({
        attempt: oaAttempts,
        application: applications,
        drive: drives,
      })
      .from(oaAttempts)
      .innerJoin(applications, eq(oaAttempts.applicationId, applications.id))
      .innerJoin(drives, eq(applications.driveId, drives.id))
      .where(eq(oaAttempts.id, attemptId))
      .limit(1);
    if (!row) return { ok: false, error: "Attempt not found." };

    await db
      .update(oaAttempts)
      .set({ manualScore })
      .where(eq(oaAttempts.id, attemptId));
    revalidateDrive(row.drive.slug, row.drive.id);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not save manual score.",
    };
  }
}

export async function createInterviewSlot(
  driveId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireHiringDb();
  if (blocked) return blocked;

  const startsAt = fromDatetimeLocalValue(formString(formData, "startsAt"));
  const endsAt = fromDatetimeLocalValue(formString(formData, "endsAt"));
  const capacity = Number(formString(formData, "capacity") || "1");
  if (!startsAt || !endsAt || endsAt <= startsAt) {
    return { ok: false, error: "Provide a valid slot window." };
  }
  if (!Number.isFinite(capacity) || capacity < 1) {
    return { ok: false, error: "Capacity must be at least 1." };
  }

  try {
    const db = getDb()!;
    const [drive] = await db
      .select()
      .from(drives)
      .where(eq(drives.id, driveId))
      .limit(1);
    if (!drive) return { ok: false, error: "Drive not found." };

    await db.insert(interviewSlots).values({
      id: crypto.randomUUID(),
      driveId,
      startsAt,
      endsAt,
      capacity,
    });
    revalidateDrive(drive.slug, driveId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not create slot.",
    };
  }
}

export async function bookInterviewSlot(
  applicationId: string,
  slotId: string,
): Promise<ActionResult> {
  const blocked = requireHiringDb();
  if (blocked) return blocked;
  const session = await requireSession("/account");

  try {
    const db = getDb()!;
    const [row] = await db
      .select({
        application: applications,
        drive: drives,
      })
      .from(applications)
      .innerJoin(drives, eq(applications.driveId, drives.id))
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.userId, session.user.id),
        ),
      )
      .limit(1);
    if (!row) return { ok: false, error: "Application not found." };
    if (!canBookInterview(row.application.stage as ApplicationStage)) {
      return { ok: false, error: "Interview booking is not open for you yet." };
    }

    const [existingBooking] = await db
      .select()
      .from(interviewBookings)
      .where(eq(interviewBookings.applicationId, applicationId))
      .limit(1);
    if (existingBooking) {
      return { ok: false, error: "You already booked a slot." };
    }

    const [slot] = await db
      .select()
      .from(interviewSlots)
      .where(
        and(
          eq(interviewSlots.id, slotId),
          eq(interviewSlots.driveId, row.drive.id),
        ),
      )
      .limit(1);
    if (!slot) return { ok: false, error: "Slot not found." };

    const [{ value: booked }] = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(interviewBookings)
      .where(eq(interviewBookings.slotId, slotId));
    if (booked >= slot.capacity) {
      return { ok: false, error: "That slot is full." };
    }

    await db.insert(interviewBookings).values({
      id: crypto.randomUUID(),
      slotId,
      applicationId,
      createdAt: new Date(),
    });

    if (row.application.stage === "shortlisted") {
      await db
        .update(applications)
        .set({ stage: "interview", updatedAt: new Date() })
        .where(eq(applications.id, applicationId));
    }

    const interviewers = await db
      .select({ email: user.email, name: user.name })
      .from(interviewAssignments)
      .innerJoin(user, eq(interviewAssignments.interviewerId, user.id))
      .where(eq(interviewAssignments.applicationId, applicationId));

    await sendTransactionalEmail({
      to: session.user.email,
      subject: `Interview booked · ${row.drive.title}`,
      html: `<p>Your interview is booked for ${slot.startsAt.toISOString()}.</p>`,
    });
    for (const interviewer of interviewers) {
      await sendTransactionalEmail({
        to: interviewer.email,
        subject: `Interview booked · ${row.drive.title}`,
        html: `<p>${session.user.name} booked an interview slot starting ${slot.startsAt.toISOString()}.</p>`,
      });
    }

    revalidateDrive(row.drive.slug, row.drive.id);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not book slot.",
    };
  }
}

export async function assignInterviewer(
  applicationId: string,
  interviewerId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireHiringDb();
  if (blocked) return blocked;

  try {
    const db = getDb()!;
    const [app] = await db
      .select({ application: applications, drive: drives })
      .from(applications)
      .innerJoin(drives, eq(applications.driveId, drives.id))
      .where(eq(applications.id, applicationId))
      .limit(1);
    if (!app) return { ok: false, error: "Application not found." };

    const [interviewer] = await db
      .select()
      .from(user)
      .where(eq(user.id, interviewerId))
      .limit(1);
    if (
      !interviewer ||
      (interviewer.role !== "interviewer" && interviewer.role !== "admin")
    ) {
      return {
        ok: false,
        error: "Pick a user with interviewer or admin role.",
      };
    }

    const [existingAssignment] = await db
      .select()
      .from(interviewAssignments)
      .where(
        and(
          eq(interviewAssignments.applicationId, applicationId),
          eq(interviewAssignments.interviewerId, interviewerId),
        ),
      )
      .limit(1);
    if (!existingAssignment) {
      await db
        .insert(interviewAssignments)
        .values({ applicationId, interviewerId });
    }

    revalidateDrive(app.drive.slug, app.drive.id);
    revalidatePath("/interviews");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not assign interviewer.",
    };
  }
}

export async function submitScorecard(
  applicationId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const blocked = requireHiringDb();
  if (blocked) return blocked;
  const session = await getSession();
  if (!session || (!canAccessAdmin(session.user.role) && session.user.role !== "interviewer")) {
    return { ok: false, error: "Interview access required." };
  }

  let rubric: { criterion: string; score: number }[] = [];
  try {
    rubric = z
      .array(
        z.object({
          criterion: z.string(),
          score: z.number().min(1).max(5),
        }),
      )
      .parse(JSON.parse(formString(formData, "rubricJson") || "[]"));
  } catch {
    return { ok: false, error: "Rubric payload is invalid." };
  }

  const recommendation = formString(formData, "recommendation") || "maybe";
  if (!["yes", "no", "maybe"].includes(recommendation)) {
    return { ok: false, error: "Recommendation must be yes, no, or maybe." };
  }

  try {
    const db = getDb()!;
    if (!canAccessAdmin(session.user.role)) {
      const [assigned] = await db
        .select()
        .from(interviewAssignments)
        .where(
          and(
            eq(interviewAssignments.applicationId, applicationId),
            eq(interviewAssignments.interviewerId, session.user.id),
          ),
        )
        .limit(1);
      if (!assigned) {
        return { ok: false, error: "You are not assigned to this applicant." };
      }
    }

    const [app] = await db
      .select({ application: applications, drive: drives })
      .from(applications)
      .innerJoin(drives, eq(applications.driveId, drives.id))
      .where(eq(applications.id, applicationId))
      .limit(1);
    if (!app) return { ok: false, error: "Application not found." };

    const notes = formString(formData, "notes");
    const [existingCard] = await db
      .select({ id: scorecards.id })
      .from(scorecards)
      .where(
        and(
          eq(scorecards.applicationId, applicationId),
          eq(scorecards.interviewerId, session.user.id),
        ),
      )
      .limit(1);

    if (existingCard) {
      await db
        .update(scorecards)
        .set({
          rubric,
          notes,
          recommendation,
          submittedAt: new Date(),
        })
        .where(eq(scorecards.id, existingCard.id));
    } else {
      await db.insert(scorecards).values({
        id: crypto.randomUUID(),
        applicationId,
        interviewerId: session.user.id,
        rubric,
        notes,
        recommendation,
        submittedAt: new Date(),
      });
    }

    revalidateDrive(app.drive.slug, app.drive.id);
    revalidatePath("/interviews");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not save scorecard.",
    };
  }
}

export async function respondToOffer(
  applicationId: string,
  decision: "accepted" | "declined",
): Promise<ActionResult> {
  const blocked = requireHiringDb();
  if (blocked) return blocked;
  const session = await requireSession("/account");

  try {
    const db = getDb()!;
    const [row] = await db
      .select({ application: applications, drive: drives })
      .from(applications)
      .innerJoin(drives, eq(applications.driveId, drives.id))
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.userId, session.user.id),
        ),
      )
      .limit(1);
    if (!row) return { ok: false, error: "Application not found." };

    const visible = applicantVisibleStage(
      row.application.stage as ApplicationStage,
      row.application.resultsPublishedAt?.toISOString() ??
        row.drive.resultsPublishedAt?.toISOString(),
    );
    if (visible !== "selected") {
      return { ok: false, error: "No offer is available to respond to." };
    }

    await db
      .update(applications)
      .set({ stage: decision, updatedAt: new Date() })
      .where(eq(applications.id, applicationId));

    revalidateDrive(row.drive.slug, row.drive.id);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not save your response.",
    };
  }
}

export async function promoteWaitlisted(
  declinedApplicationId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requireHiringDb();
  if (blocked) return blocked;

  try {
    const db = getDb()!;
    const [declined] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, declinedApplicationId))
      .limit(1);
    if (!declined || declined.stage !== "declined") {
      return { ok: false, error: "Pick a declined application." };
    }

    const [next] = await db
      .select({
        application: applications,
        applicant: user,
        drive: drives,
      })
      .from(applications)
      .innerJoin(user, eq(applications.userId, user.id))
      .innerJoin(drives, eq(applications.driveId, drives.id))
      .where(
        and(
          eq(applications.driveId, declined.driveId),
          eq(applications.roleId, declined.roleId),
          eq(applications.stage, "waitlisted"),
        ),
      )
      .orderBy(asc(applications.createdAt))
      .limit(1);

    if (!next) {
      return { ok: false, error: "No waitlisted applicant for that role." };
    }

    await db
      .update(applications)
      .set({
        stage: "selected",
        resultsPublishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(applications.id, next.application.id));

    await emailStageChange(
      next.applicant.email,
      next.applicant.name,
      next.drive.title,
      "selected",
    );

    revalidateDrive(next.drive.slug, next.drive.id);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not promote waitlisted applicant.",
    };
  }
}

export async function exportDriveCsv(driveId: string): Promise<ActionResult & { csv?: string }> {
  await requireAdmin();
  const blocked = requireHiringDb();
  if (blocked) return blocked;

  const apps = await listDriveApplications(driveId);
  const header = [
    "name",
    "roll_number",
    "email",
    "year",
    "branch",
    "role",
    "stage",
  ];
  const lines = [header.join(",")];
  for (const app of apps) {
    const cells = [
      app.user.name,
      app.user.rollNumber ?? "",
      app.user.email,
      app.user.year ?? "",
      app.user.branch ?? "",
      app.role.name,
      app.stage,
    ].map((value) => `"${String(value).replaceAll('"', '""')}"`);
    lines.push(cells.join(","));
  }
  return { ok: true, csv: lines.join("\n") };
}
