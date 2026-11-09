"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navPrimary, site } from "@/content/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "border-line bg-paper/90 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-[var(--measure)] items-center justify-between gap-6 px-[var(--gutter)]">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
            {site.name}
          </span>
          <span className="hidden text-ember sm:inline" aria-hidden>
            ·
          </span>
          <span className="hidden font-mono text-[0.62rem] uppercase tracking-[0.16em] text-mute md:inline">
            MANIT
          </span>
        </Link>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Primary"
        >
          {navPrimary.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium transition-colors",
                  active ? "text-ink" : "text-mute hover:text-ink",
                )}
              >
                {item.label}
                {active ? (
                  <span className="absolute -bottom-1 left-0 h-px w-full bg-ember" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button href="/join" variant="ember" size="sm" className="hidden sm:inline-flex">
            Join
          </Button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-line bg-paper-elevated lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-line bg-paper px-[var(--gutter)] py-5 lg:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {[
              ...navPrimary,
              { href: "/team", label: "Team" },
              { href: "/join", label: "Join" },
              { href: "/login", label: "Sign in" },
              { href: "/contact", label: "Contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line py-3.5 text-base font-medium text-ink last:border-0"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
