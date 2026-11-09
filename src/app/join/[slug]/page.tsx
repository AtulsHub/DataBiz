import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { drives } from "@/content/drives";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { PageHero } from "@/components/ui/PageHero";

type Props = { params: Promise<{ slug: string }> };

function getDrive(slug: string) {
  return drives.find((d) => d.slug === slug && d.status !== "draft");
}

export function generateStaticParams() {
  const params = drives.filter((d) => d.status !== "draft").map((d) => ({ slug: d.slug }));
  // Cache Components requires at least one param; this placeholder resolves to notFound().
  return params.length > 0 ? params : [{ slug: "no-drive" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const drive = getDrive(slug);
  if (!drive) return { title: "Drive not found" };
  return { title: drive.title, description: drive.description };
}

export default async function DrivePage({ params }: Props) {
  const { slug } = await params;
  const drive = getDrive(slug);
  if (!drive) notFound();

  const closed = drive.status === "closed";

  return (
    <>
      <PageHero
        index={closed ? "Closed" : "Open"}
        label="Recruitment drive"
        title={drive.title}
        description={drive.description}
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div>
            <DeskLabel index="Roles">Open roles</DeskLabel>
            <ol className="mt-4 divide-y divide-line border-y border-line">
              {drive.roles.map((role, i) => (
                <li key={role.name} className="grid gap-2 py-6 sm:grid-cols-[4rem_1fr] sm:gap-6">
                  <span className="font-mono text-sm text-signal">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight">{role.name}</h2>
                    <p className="mt-1 max-w-xl leading-relaxed text-steel">{role.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <aside className="space-y-6 lg:border-l lg:border-line lg:pl-8" aria-label="Drive timeline">
            <dl className="space-y-4">
              <div>
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">Opens</dt>
                <dd className="mt-1 font-medium">{formatDate(drive.opensAt)}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-steel">Closes</dt>
                <dd className="mt-1 font-medium">{formatDate(drive.closesAt)}</dd>
              </div>
            </dl>
            {closed ? (
              <p role="status" className="text-sm text-steel">
                This drive has closed. Watch the announcements page for the next one.
              </p>
            ) : (
              <Button href="/login" variant="signal" size="md" className="w-full">
                Sign in to apply
              </Button>
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
