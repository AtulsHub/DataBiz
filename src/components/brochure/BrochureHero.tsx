"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { brochure } from "@/content/brochure";
import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ConstellationField } from "@/components/brochure/BrochureArt";

export function BrochureHero() {
  const reduce = useReducedMotion();

  return (
    <header className="relative isolate min-h-[min(100svh,54rem)] overflow-hidden border-b border-line">
      <Image
        src={brochure.media.campus}
        alt="Maulana Azad National Institute of Technology, Bhopal"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, color-mix(in srgb, var(--void) 88%, transparent) 0%, color-mix(in srgb, var(--void) 62%, transparent) 42%, color-mix(in srgb, var(--void) 35%, transparent) 100%)",
        }}
      />
      <ConstellationField className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen" />

      <Container className="relative z-[1] flex min-h-[min(100svh,54rem)] flex-col justify-end pb-14 pt-28 sm:pb-20 sm:pt-32">
        <motion.div
          className="flex items-center gap-4"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={brochure.media.seal}
            alt="MANIT Bhopal seal"
            width={56}
            height={56}
            className="size-12 rounded-full bg-paper-elevated/90 object-contain p-1 sm:size-14"
          />
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ember">
            {site.college}
          </p>
        </motion.div>

        <motion.p
          className="mt-6 font-display text-[clamp(3.4rem,13vw,8.5rem)] font-semibold leading-[0.85] tracking-[-0.06em] text-on-void"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          {site.name}
        </motion.p>

        <motion.div
          className="mt-6 max-w-xl"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-ember">
            {brochure.tagline}
          </p>
          <h1 className="mt-4 font-display text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-balance text-on-void">
            Put your brand in front of MANIT&apos;s data talent.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-on-void-soft sm:text-lg">
            {brochure.summary}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              href={`mailto:${site.email}?subject=${encodeURIComponent("Sponsorship inquiry — DataBiz")}`}
              variant="ember"
              size="lg"
            >
              Partner with us
            </Button>
            <Button href="#packages" variant="inverse" size="lg">
              View packages
            </Button>
            <Button href={brochure.pdfHref} external variant="link" className="text-on-void">
              PDF
            </Button>
          </div>
        </motion.div>
      </Container>
    </header>
  );
}
