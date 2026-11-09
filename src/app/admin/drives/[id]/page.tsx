import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { DriveEditorForm } from "@/components/admin/DriveEditorForm";
import { DriveRolesForm } from "@/components/admin/DriveRolesForm";
import { DriveQuestionsForm } from "@/components/admin/DriveQuestionsForm";
import { DriveApplicationsPanel } from "@/components/admin/DriveApplicationsPanel";
import { DriveSlotsForm } from "@/components/admin/DriveSlotsForm";
import { AssignInterviewerForm } from "@/components/admin/AssignInterviewerForm";
import {
  getAdminDrive,
  isDrivesDbReady,
} from "@/lib/drives";
import {
  listAdminQuestionsForRole,
  listDriveApplications,
  listSlotsForDrive,
} from "@/lib/applications";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import { inArray } from "drizzle-orm";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const drive = await getAdminDrive(id);
  return { title: drive ? `Admin · ${drive.title}` : "Admin · Drive" };
}

export default async function AdminDriveDetailPage({ params }: Props) {
  if (!isDrivesDbReady()) redirect("/admin/drives");
  const { id } = await params;
  const drive = await getAdminDrive(id);
  if (!drive) notFound();

  const apps = await listDriveApplications(drive.id);
  const slots = await listSlotsForDrive(drive.id);

  const db = getDb();
  const interviewers = db
    ? await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        })
        .from(user)
        .where(inArray(user.role, ["interviewer", "admin"]))
    : [];

  const roleQuestions = await Promise.all(
    drive.roles.map(async (role) => ({
      role,
      questions: await listAdminQuestionsForRole(role.id),
    })),
  );

  return (
    <Container className="space-y-14 py-12">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {drive.title}
        </h1>
        <p className="mt-2 font-mono text-xs text-mute">
          /join/{drive.slug} · {drive.status}
          {drive.resultsPublishedAt ? " · results published" : ""}
        </p>
        {drive.status === "open" ? (
          <p className="mt-4 text-sm text-mute">
            <Link
              href={`/admin/newsletter?source=drive&id=${encodeURIComponent(drive.id)}&subject=${encodeURIComponent(`Recruiting · ${drive.title}`)}&body=${encodeURIComponent(`${drive.title} is open.\n\nhttps://www.databiz.in/join/${drive.slug}`)}`}
              className="text-ember hover:underline"
            >
              Mail confirmed subscribers that this drive is open
            </Link>
          </p>
        ) : null}
      </div>

      <section className="max-w-3xl space-y-4">
        <h2 className="font-display text-xl font-semibold">Window</h2>
        <DriveEditorForm drive={drive} />
      </section>

      <section className="max-w-3xl space-y-4">
        <h2 className="font-display text-xl font-semibold">Roles</h2>
        <DriveRolesForm driveId={drive.id} roles={drive.roles} />
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-xl font-semibold">OA questions</h2>
        {roleQuestions.length === 0 ? (
          <p className="text-sm text-mute">Save roles first, then add questions.</p>
        ) : (
          roleQuestions.map(({ role, questions }) => (
            <DriveQuestionsForm
              key={role.id}
              roleId={role.id}
              roleName={role.name}
              questions={questions.map((q) => ({
                id: q.id,
                prompt: q.prompt,
                kind: q.kind,
                options: q.options,
                answerKey: q.answerKey,
                points: q.points,
              }))}
            />
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Applications</h2>
        <DriveApplicationsPanel
          driveId={drive.id}
          resultsPublished={Boolean(drive.resultsPublishedAt)}
          applications={apps.map((app) => ({
            id: app.id,
            stage: app.stage,
            role: { name: app.role.name },
            user: app.user,
            attempt: app.attempt,
          }))}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Interview slots</h2>
        <DriveSlotsForm driveId={drive.id} slots={slots} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">
          Assign interviewers
        </h2>
        <AssignInterviewerForm
          applications={apps.map((app) => ({
            id: app.id,
            label: `${app.user.name} · ${app.role.name}`,
          }))}
          interviewers={interviewers.map((person) => ({
            id: person.id,
            label: `${person.name} (${person.role})`,
          }))}
        />
      </section>
    </Container>
  );
}
