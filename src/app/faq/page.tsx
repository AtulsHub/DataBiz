import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { faqItems } from "@/content/pages";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about joining DataBiz, events, and hiring.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        index="FAQ"
        label="Questions"
        title="Short answers to common questions."
      />
      <section className="py-14 sm:py-20">
        <Container width="narrow">
          {faqItems.length === 0 ? (
            <EmptyState
              label="FAQ"
              title="No questions listed yet."
              body="Ask the core directly and we'll add it here."
              action={{ href: "/contact", label: "Contact" }}
            />
          ) : (
            <div className="divide-y divide-line border-y border-line">
              {faqItems.map((item, i) => (
                <details key={item.question} className="group py-1">
                  <summary className="flex cursor-pointer list-none items-center gap-5 py-5 [&::-webkit-details-marker]:hidden">
                    <span className="font-mono text-sm text-signal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-display text-xl font-bold tracking-tight">
                      {item.question}
                    </span>
                    <Plus
                      size={20}
                      aria-hidden
                      className="shrink-0 text-steel transition-transform group-open:rotate-45"
                    />
                  </summary>
                  <p className="pb-6 pl-[calc(1.25rem+1.25rem)] pr-8 font-serif text-lg leading-relaxed text-ink-soft">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          )}
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <p className="text-steel">Still unsure?</p>
            <Button href="/contact" variant="ghost" size="sm">
              Ask the core
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
