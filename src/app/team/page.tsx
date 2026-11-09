import type { Metadata } from "next";
import Image from "next/image";
import { getCurrentTeam } from "@/content/team";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Team",
  description: "The core team running DataBiz at NIT Bhopal.",
};

export default function TeamPage() {
  const team = getCurrentTeam();

  return (
    <>
      <PageHero
        index="02"
        label="Team"
        title="The people behind the sessions."
        description="Roles rotate each year. Names appear here only once the core has published them."
      />
      <section className="py-16 sm:py-20">
        <Container>
          {team.length === 0 ? (
            <EmptyState
              label="Roster pending"
              title="The core will publish the roster here."
              body="We do not list names until the current core confirms them. Check back soon, or write to us if you need to reach someone now."
              action={{ href: "/contact", label: "Contact the core" }}
            />
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {team.map((member, i) => (
                <li key={`${member.name}-${member.sortOrder}`}>
                  <Reveal
                    y={10}
                    delay={0.03 * i}
                    className="grid gap-5 py-7 sm:grid-cols-[6rem_1fr_1.4fr] sm:items-start sm:gap-8"
                  >
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={`Portrait of ${member.name}`}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-[var(--radius)] border border-line object-cover"
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="flex h-24 w-24 items-center justify-center rounded-[var(--radius)] bg-panel font-display text-3xl font-bold text-spark"
                      >
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="font-display text-2xl font-bold tracking-tight">
                        {member.name}
                      </h2>
                      <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-signal">
                        {member.roleTitle}
                        {member.yearLabel ? ` · ${member.yearLabel}` : ""}
                      </p>
                    </div>
                    <p className="leading-relaxed text-steel">{member.bio}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
