import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { homeExplore } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function HomeExplore() {
  return (
    <section className="relative border-b border-line py-14 sm:py-16">
      <Container>
        <Reveal>
          <p className="eyebrow">Find your way</p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl text-balance">
            The parts of DataBiz you will use most.
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homeExplore.map((item, i) => (
            <li key={item.href}>
              <Reveal delay={0.04 * i} className="h-full">
                <Link
                  href={item.href}
                  className="surface-card surface-card-hover group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-[var(--radius)] p-6 sm:p-7"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-ember/15 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full opacity-70 blur-2xl"
                    style={{ background: "var(--glow-cool)" }}
                  />
                  <div className="relative">
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ember">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-3 font-display text-xl font-semibold tracking-tight text-ink transition-colors group-hover:text-ember">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-mute">
                      {item.body}
                    </p>
                  </div>
                  <span className="relative inline-flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mute transition-colors group-hover:text-ember">
                    Open <ArrowUpRight size={12} aria-hidden />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
