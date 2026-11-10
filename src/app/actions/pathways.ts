"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/db";
import {
  pathwayModules,
  pathwayProgress,
  pathways,
} from "@/db/schema";
import type { ActionResult } from "@/app/actions/events";
import {
  canTrackPathwayProgress,
  ensureSeedPathways,
} from "@/lib/pathways";
import { clampToDraftIfNeeded } from "@/lib/publish";
import { requireAdmin, requireDesk, getSession } from "@/lib/session";
import { slugify } from "@/lib/slug";

const moduleSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Module title is required."),
  description: z.string().trim().default(""),
  url: z
    .string()
    .trim()
    .url("Each module needs a valid URL.")
    .refine((value) => /^https?:\/\//i.test(value), "Use http:// or https://."),
  sortOrder: z.number().int().nonnegative().optional(),
});

const pathwayFields = z.object({
  title: z.string().trim().min(1, "Title is required."),
  slug: z.string().trim().optional(),
  summary: z.string().trim().default(""),
  discipline: z.enum(["data", "ml", "ai", "other"]),
  status: z.enum(["draft", "published"]),
  sortOrder: z.coerce.number().int().default(0),
  modules: z.array(moduleSchema).default([]),
});

function requirePathwaysDb(): ActionResult | null {
  if (!isDatabaseConfigured() || !getDb()) {
    return {
      ok: false,
      error:
        "DATABASE_URL is not set. Add Neon credentials to .env.local and run pnpm db:push.",
    };
  }
  return null;
}

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseModulesJson(raw: string) {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function parsePathwayForm(formData: FormData) {
  const modulesRaw = parseModulesJson(formString(formData, "modulesJson"));
  if (modulesRaw === null) {
    return {
      success: false as const,
      error: new z.ZodError([
        {
          code: "custom",
          path: ["modules"],
          message: "Modules payload is invalid.",
        },
      ]),
    };
  }

  const intent = formString(formData, "intent");
  const statusFromIntent =
    intent === "publish"
      ? "published"
      : intent === "draft"
        ? "draft"
        : undefined;
  const status =
    statusFromIntent ||
    (formString(formData, "status") === "published" ? "published" : "draft");

  return pathwayFields.safeParse({
    title: formString(formData, "title"),
    slug: formString(formData, "slug") || undefined,
    summary: formString(formData, "summary"),
    discipline: formString(formData, "discipline") || "other",
    status,
    sortOrder: formString(formData, "sortOrder") || "0",
    modules: modulesRaw,
  });
}

async function uniqueSlug(base: string, excludeId?: string) {
  const db = getDb()!;
  let candidate = slugify(base) || `pathway-${Date.now()}`;
  let attempt = 0;
  while (attempt < 20) {
    const [existing] = await db
      .select({ id: pathways.id })
      .from(pathways)
      .where(eq(pathways.slug, candidate))
      .limit(1);
    if (!existing || existing.id === excludeId) return candidate;
    attempt += 1;
    candidate = `${slugify(base) || "pathway"}-${attempt + 1}`;
  }
  return `${candidate}-${crypto.randomUUID().slice(0, 8)}`;
}

function revalidatePathwayPaths(slug: string, previousSlug?: string) {
  revalidatePath("/learn");
  revalidatePath(`/learn/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/learn/${previousSlug}`);
  }
  revalidatePath("/");
  revalidatePath("/account");
  revalidatePath("/admin/learn");
}

export async function seedPathwaysAction(): Promise<ActionResult> {
  await requireAdmin();
  const blocked = requirePathwaysDb();
  if (blocked) return blocked;

  try {
    const result = await ensureSeedPathways();
    revalidatePath("/learn");
    revalidatePath("/");
    revalidatePath("/admin/learn");
    return {
      ok: true,
      error: result.inserted
        ? undefined
        : "Pathways already exist in the database.",
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not seed pathways.",
    };
  }
}

export async function createPathway(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireDesk();
  const blocked = requirePathwaysDb();
  if (blocked) return blocked;

  const parsed = parsePathwayForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Fix the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const status = clampToDraftIfNeeded(
    session.user.role,
    parsed.data.status,
    "draft",
  );

  let id: string;
  try {
    const db = getDb()!;
    await ensureSeedPathways();
    const slug = await uniqueSlug(
      parsed.data.slug?.trim() || parsed.data.title,
    );
    id = crypto.randomUUID();

    await db.insert(pathways).values({
      id,
      slug,
      title: parsed.data.title,
      summary: parsed.data.summary,
      discipline: parsed.data.discipline,
      status,
      sortOrder: parsed.data.sortOrder,
    });

    if (parsed.data.modules.length > 0) {
      await db.insert(pathwayModules).values(
        parsed.data.modules.map((mod, index) => ({
          id: crypto.randomUUID(),
          pathwayId: id,
          title: mod.title,
          description: mod.description,
          url: mod.url,
          sortOrder: mod.sortOrder ?? index + 1,
        })),
      );
    }

    revalidatePathwayPaths(slug);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not create pathway.",
    };
  }

  redirect(`/admin/learn/${id}`);
}

export async function updatePathway(
  pathwayId: string,
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireDesk();
  const blocked = requirePathwaysDb();
  if (blocked) return blocked;

  const parsed = parsePathwayForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Fix the highlighted fields and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const status = clampToDraftIfNeeded(
    session.user.role,
    parsed.data.status,
    "draft",
  );

  try {
    const db = getDb()!;
    const [existing] = await db
      .select()
      .from(pathways)
      .where(eq(pathways.id, pathwayId))
      .limit(1);
    if (!existing) return { ok: false, error: "Pathway not found." };

    const requestedSlug = parsed.data.slug?.trim();
    const slug =
      requestedSlug && requestedSlug !== existing.slug
        ? await uniqueSlug(requestedSlug, pathwayId)
        : existing.slug;

    await db
      .update(pathways)
      .set({
        title: parsed.data.title,
        slug,
        summary: parsed.data.summary,
        discipline: parsed.data.discipline,
        status,
        sortOrder: parsed.data.sortOrder,
      })
      .where(eq(pathways.id, pathwayId));

    const existingModules = await db
      .select({ id: pathwayModules.id })
      .from(pathwayModules)
      .where(eq(pathwayModules.pathwayId, pathwayId));
    const keepIds = new Set(
      parsed.data.modules
        .map((m) => m.id)
        .filter((id): id is string => Boolean(id)),
    );

    for (const row of existingModules) {
      if (!keepIds.has(row.id)) {
        await db
          .delete(pathwayModules)
          .where(eq(pathwayModules.id, row.id));
      }
    }

    for (const [index, mod] of parsed.data.modules.entries()) {
      const sortOrder = mod.sortOrder ?? index + 1;
      if (mod.id && keepIds.has(mod.id)) {
        await db
          .update(pathwayModules)
          .set({
            title: mod.title,
            description: mod.description,
            url: mod.url,
            sortOrder,
          })
          .where(
            and(
              eq(pathwayModules.id, mod.id),
              eq(pathwayModules.pathwayId, pathwayId),
            ),
          );
      } else {
        await db.insert(pathwayModules).values({
          id: crypto.randomUUID(),
          pathwayId,
          title: mod.title,
          description: mod.description,
          url: mod.url,
          sortOrder,
        });
      }
    }

    revalidatePathwayPaths(slug, existing.slug);
    revalidatePath(`/admin/learn/${pathwayId}`);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not update pathway.",
    };
  }
}

export async function setPathwayModuleComplete(
  moduleId: string,
  completed: boolean,
): Promise<ActionResult> {
  const blocked = requirePathwaysDb();
  if (blocked) return blocked;

  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Sign in to track pathway progress." };
  }
  if (!canTrackPathwayProgress(session.user.role)) {
    return {
      ok: false,
      error: "Pathway progress is available to members and admins.",
    };
  }

  try {
    const db = getDb()!;
    const [mod] = await db
      .select({
        id: pathwayModules.id,
        pathwayId: pathwayModules.pathwayId,
      })
      .from(pathwayModules)
      .where(eq(pathwayModules.id, moduleId))
      .limit(1);
    if (!mod) return { ok: false, error: "Module not found." };

    const [pathway] = await db
      .select({ slug: pathways.slug, status: pathways.status })
      .from(pathways)
      .where(eq(pathways.id, mod.pathwayId))
      .limit(1);
    if (!pathway || pathway.status !== "published") {
      return { ok: false, error: "That pathway is not published." };
    }

    if (completed) {
      await db
        .insert(pathwayProgress)
        .values({
          userId: session.user.id,
          moduleId,
          completedAt: new Date(),
        })
        .onConflictDoNothing();
    } else {
      await db
        .delete(pathwayProgress)
        .where(
          and(
            eq(pathwayProgress.userId, session.user.id),
            eq(pathwayProgress.moduleId, moduleId),
          ),
        );
    }

    revalidatePath(`/learn/${pathway.slug}`);
    revalidatePath("/account");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not update module progress.",
    };
  }
}
