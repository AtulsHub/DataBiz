"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  caption?: string;
};

/** Gallery thumbnail that opens a large lightbox on click. */
export function GalleryImage({
  src,
  alt,
  width = 800,
  height = 500,
  sizes = "(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw",
  className = "aspect-[4/3] w-full object-cover",
  caption,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="group m-0 block w-full cursor-zoom-in overflow-hidden border-0 bg-transparent p-0 text-left"
        onClick={() => setOpen(true)}
        aria-label={`Enlarge photo${alt ? `: ${alt}` : ""}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          draggable={false}
          className={`transition duration-300 group-hover:scale-[1.02] ${className}`}
        />
      </button>

      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <button
                type="button"
                className="absolute inset-0 border-0 bg-[color-mix(in_srgb,var(--void)_78%,transparent)] backdrop-blur-sm"
                aria-label="Close enlarged photo"
                onClick={() => setOpen(false)}
              />

              <div className="relative z-[1] flex max-h-[min(92vh,56rem)] w-full max-w-5xl flex-col">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p
                    id={titleId}
                    className="truncate font-mono text-[0.65rem] uppercase tracking-[0.16em] text-on-void-mute"
                  >
                    {caption || alt || "Gallery photo"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex size-10 items-center justify-center rounded-sm border border-on-void-line bg-void-soft text-on-void transition hover:border-ember hover:text-ember"
                    aria-label="Close"
                  >
                    <X className="size-4" strokeWidth={1.75} />
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-[var(--radius)] border border-on-void-line bg-void shadow-[var(--shadow-lift)]">
                  <Image
                    src={src}
                    alt={alt}
                    width={1600}
                    height={1000}
                    sizes="(min-width: 1024px) 64rem, 100vw"
                    priority
                    className="max-h-[min(80vh,48rem)] w-full object-contain"
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
