import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function HomeMission() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-void py-20 text-on-void sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 45% 55% at 100% 0%, color-mix(in srgb, var(--ember) 20%, transparent), transparent 55%), radial-gradient(ellipse 40% 45% at 0% 100%, color-mix(in srgb, #7a8cab 14%, transparent), transparent 50%)",
        }}
      />
      <Container className="relative">
        <Reveal>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ember">
            Mission
          </p>
          <p className="mt-6 max-w-4xl font-serif text-3xl leading-[1.25] tracking-tight text-balance sm:text-5xl">
            {site.mission}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/about" variant="ember" size="md">
              About the society
            </Button>
            <Button
              href="/team"
              variant="ghost"
              size="md"
              className="border-on-void-line text-on-void hover:border-ember hover:bg-transparent hover:text-ember"
            >
              Team
            </Button>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-8 border-t border-on-void-line pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {site.values.map((value, i) => (
            <Reveal key={value.title} delay={0.05 * i}>
              <p className="font-mono text-[0.65rem] text-ember">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-on-void">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-on-void-soft">
                {value.body}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
