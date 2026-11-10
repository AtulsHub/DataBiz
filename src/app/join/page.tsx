import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getOpenDrive } from "@/lib/drives";
import { site } from "@/content/site";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "Join",
  description: "Recruitment for DataBiz at NIT Bhopal.",
};

async function JoinContent() {
  await connection();
  const drive = await getOpenDrive();

  if (drive) {
    return (
      <>
        <PageHero
          index="10"
          label="Recruiting now"
          title={drive.title}
          description={drive.description.split("\n")[0] || drive.description}
        >
          <div className="mt-6">
            <Button href={`/join/${drive.slug}`} variant="ember" size="lg">
              View the drive
            </Button>
          </div>
        </PageHero>
        <section className="py-16">
          <Container>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-steel">
              Closes {formatDate(drive.closesAt)}
            </p>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        index="10"
        label="Join"
        title="Recruitment is closed right now."
        description="DataBiz opens a drive when the core is ready to take on new members."
      />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div
            role="status"
            className="border border-line-strong bg-void p-8 text-on-void sm:p-10"
          >
            <DeskLabel tone="inverse">Notice</DeskLabel>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">
              No open drive.
            </h2>
            <p className="mt-3 max-w-lg leading-relaxed text-on-void-soft">
              When a drive opens, it appears here and on the home page with
              roles, dates, and how the assessment and interviews work.
              Applicants sign in with an @stu.manit.ac.in address.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/login" variant="ember" size="md">
                Sign in
              </Button>
              <Button href="/contact" variant="inverse" size="md">
                Ask the core
              </Button>
            </div>
          </div>

          <div>
            <DeskLabel>While you wait</DeskLabel>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {[
                { href: "/learn", label: "Work through a pathway" },
                { href: "/events", label: "Come to an event" },
                { href: "/blog", label: "Read what members write" },
                { href: "/faq", label: "Read the FAQ" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group flex items-center justify-between py-4 font-medium hover:text-signal"
                  >
                    {l.label}
                    <ArrowUpRight
                      size={18}
                      aria-hidden
                      className="text-ink/40 group-hover:text-signal"
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-steel">
              Questions about {site.name}? Write to{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-medium text-signal hover:underline"
              >
                {site.email}
              </a>
              .
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <PageHero index="10" label="Join" title="Checking recruitment…" />
      }
    >
      <JoinContent />
    </Suspense>
  );
}
