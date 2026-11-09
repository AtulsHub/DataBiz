import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  getPublicDriveBySlug,
  isDriveAcceptingApplications,
  listStaticDriveParams,
} from "@/lib/drives";
import { getApplicationForUser, requireMemberProfile } from "@/lib/applications";
import { getSession } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { Markdown } from "@/components/ui/Markdown";
import { PageHero } from "@/components/ui/PageHero";
import { DriveApplyForm } from "@/components/forms/DriveApplyForm";

type Props = { params: Promise<{ slug: string }> };

export const instant = false;

export async function generateStaticParams() {
  return listStaticDriveParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const drive = await getPublicDriveBySlug(slug);
  if (!drive) return { title: "Drive not found" };
  return { title: drive.title, description: drive.description.slice(0, 160) };
}

async function DriveContent({ slug }: { slug: string }) {
  await connection();
  const drive = await getPublicDriveBySlug(slug);
  if (!drive) notFound();

  const closed = !isDriveAcceptingApplications(drive);
  const session = await getSession();
  const existing = session
    ? await getApplicationForUser(session.user.id, drive.id)
    : null;
  const profileReady = session
    ? !requireMemberProfile(session.user)
    : false;

  return (
    <>
      <PageHero
        index={closed ? "Closed" : "Open"}
        label="Recruitment drive"
        title={drive.title}
        description={drive.description.split("\n")[0] || drive.description}
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div className="space-y-10">
            <div>
              <DeskLabel index="Roles">Open roles</DeskLabel>
              <ol className="mt-4 divide-y divide-line border-y border-line">
                {drive.roles.map((role, i) => (
                  <li
                    key={role.id}
                    className="grid gap-2 py-6 sm:grid-cols-[4rem_1fr] sm:gap-6"
                  >
                    <span className="font-mono text-sm text-signal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="font-display text-2xl font-bold tracking-tight">
                        {role.name}
                      </h2>
                      <p className="mt-1 max-w-xl leading-relaxed text-steel">
                        {role.description}
                      </p>
                      <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-mute">
                        OA · {role.oaMode.replaceAll("_", " ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            {drive.description.includes("\n") ? (
              <div>
                <DeskLabel>About this drive</DeskLabel>
                <div className="mt-4">
                  <Markdown content={drive.description} />
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6 lg:border-l lg:border-line lg:pl-8" aria-label="Apply">
            <dl className="space-y-4">
              <div>
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">
                  Opens
                </dt>
                <dd className="mt-1 font-medium">{formatDate(drive.opensAt)}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">
                  Closes
                </dt>
                <dd className="mt-1 font-medium">{formatDate(drive.closesAt)}</dd>
              </div>
            </dl>
            {closed ? (
              <p role="status" className="text-sm text-steel">
                This drive is not accepting applications right now.
              </p>
            ) : (
              <DriveApplyForm
                drive={drive}
                signedIn={Boolean(session)}
                profileReady={profileReady}
                alreadyApplied={Boolean(existing)}
              />
            )}
            <Button href="/join" variant="link">
              ← Recruitment
            </Button>
          </aside>
        </Container>
      </section>
    </>
  );
}

export default async function DrivePage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <PageHero label="Recruitment drive" title="Loading drive…" description="" />
      }
    >
      <DriveContent slug={slug} />
    </Suspense>
  );
}
