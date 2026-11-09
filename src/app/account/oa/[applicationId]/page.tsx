import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { oaAttempts } from "@/db/schema/hiring";
import {
  canTakeOa,
  listPublicQuestionsForRole,
  type ApplicationStage,
} from "@/lib/applications";
import { requireSession } from "@/lib/session";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { OaTakePanel } from "@/components/account/OaTakePanel";
import { applications, driveRoles, drives } from "@/db/schema";

export const instant = false;

type Props = { params: Promise<{ applicationId: string }> };

export const metadata: Metadata = { title: "Online assessment" };

export default async function OaPage({ params }: Props) {
  const session = await requireSession("/account");
  const { applicationId } = await params;
  const db = getDb();
  if (!db) redirect("/account");

  const [row] = await db
    .select({
      application: applications,
      role: driveRoles,
      drive: drives,
    })
    .from(applications)
    .innerJoin(driveRoles, eq(applications.roleId, driveRoles.id))
    .innerJoin(drives, eq(applications.driveId, drives.id))
    .where(eq(applications.id, applicationId))
    .limit(1);

  if (!row || row.application.userId !== session.user.id) notFound();
  if (!canTakeOa(row.application.stage as ApplicationStage)) {
    redirect("/account");
  }

  const now = new Date();
  let questions = await listPublicQuestionsForRole(row.role.id);
  if (row.role.oaMode === "live_quiz") {
    if (!row.role.liveStartsAt || now < row.role.liveStartsAt) {
      questions = [];
    }
  }

  const [attempt] = await db
    .select()
    .from(oaAttempts)
    .where(eq(oaAttempts.applicationId, applicationId))
    .limit(1);

  return (
    <>
      <PageHero
        label="Online assessment"
        title={row.drive.title}
        description={`${row.role.name} · ${row.role.oaMode.replaceAll("_", " ")}`}
      />
      <section className="py-12 sm:py-16">
        <Container className="max-w-3xl">
          {row.role.oaMode === "live_quiz" &&
          (!row.role.liveStartsAt || now < row.role.liveStartsAt) ? (
            <p className="text-sm text-mute">
              Questions unlock when the live window starts.
            </p>
          ) : (
            <OaTakePanel
              applicationId={applicationId}
              questions={questions}
              oaMode={row.role.oaMode}
              initialAttemptId={attempt?.id}
              alreadySubmitted={attempt?.status === "submitted"}
            />
          )}
        </Container>
      </section>
    </>
  );
}
