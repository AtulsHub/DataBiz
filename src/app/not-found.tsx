import { Container } from "@/components/ui/Container";
import { DeskLabel } from "@/components/ui/DeskLabel";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 desk-grid opacity-60"
      />
      <Container className="relative">
        <DeskLabel index="404">Signal lost</DeskLabel>
        <h1 className="mt-5 font-display text-[clamp(3rem,9vw,7rem)] font-bold leading-[0.9] tracking-[-0.05em] text-balance">
          This page isn&apos;t in the dataset.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-steel">
          The link may be old, or the page may not be published yet. Try one of
          the routes below.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/" variant="primary">
            Back home
          </Button>
          <Button href="/events" variant="ghost">
            Events
          </Button>
          <Button href="/blog" variant="ghost">
            Blog
          </Button>
          <Button href="/contact" variant="ghost">
            Contact
          </Button>
        </div>
      </Container>
    </section>
  );
}
