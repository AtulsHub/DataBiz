import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { scorecards } from "@/db/schema/hiring";
import { canRunInterviews, listAssignedApplications } from "@/lib/applications";
import { requireSession } from "@/lib/session";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { ScorecardForm } from "@/components/interviews/ScorecardForm";

export const metadata: Metadata = { title: "Interviews" };
export const instant = false;

export default async function InterviewsPage() {
  const session = await requireSession("/interviews");
  if (!canRunInterviews(session.user.role)) redirect("/account");

  const assigned = await listAssignedApplications(session.user.id);
  const db = getDb();

  const existing = db
    ? await db
        .select()
        .from(scorecards)
        .where(eq(scorecards.interviewerId, session.user.id))
    : [];

  return (
    <>
      <PageHero
        label="Interviews"
        title="Assigned applicants"
        description="Submit one scorecard per assigned applicant. Applicants never see this."
      />
      <section className="py-12 sm:py-16">
        <Container className="max-w-3xl space-y-8">
          {assigned.length === 0 ? (
            <p className="text-sm text-mute">No applicants assigned to you.</p>
          ) : (
            assigned.map((row) => {
              const card = existing.find(
                (s) => s.applicationId === row.applicationId,
              );
              return (
                <div key={row.applicationId} className="border border-line p-5">
                  <p className="font-medium text-ink">{row.applicant.name}</p>
                  <p className="mt-1 font-mono text-xs text-mute">
                    {row.driveTitle} · {row.roleName} · {row.stage}
                  </p>
                  <p className="mt-2 text-sm text-steel">
                    {row.applicant.email}
                    {row.applicant.year ? ` · ${row.applicant.year}` : ""}
                    {row.applicant.branch ? ` · ${row.applicant.branch}` : ""}
                  </p>
                  <div className="mt-5">
                    <ScorecardForm
                      applicationId={row.applicationId}
                      defaultNotes={card?.notes}
                      defaultRecommendation={card?.recommendation ?? "maybe"}
                      defaultRubric={
                        card?.rubric ?? [
                          { criterion: "Technical", score: 3 },
                          { criterion: "Communication", score: 3 },
                          { criterion: "Culture fit", score: 3 },
                        ]
                      }
                    />
                  </div>
                </div>
              );
            })
          )}
        </Container>
      </section>
    </>
  );
}
