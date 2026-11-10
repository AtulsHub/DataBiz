"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  CalendarDays,
  Images,
  Clapperboard,
  Briefcase,
  Route,
  Newspaper,
  Megaphone,
  Mail,
  Handshake,
  FolderOpen,
  Menu,
  X,
  ExternalLink,
  UserRound,
} from "lucide-react";
import type { Role } from "@/lib/roles";

type NavLink = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  adminOnly?: boolean;
};

const groups: { label: string; links: NavLink[] }[] = [
  {
    label: "Overview",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Create & upload",
    links: [
      { href: "/admin/events", label: "Events", icon: CalendarDays },
      { href: "/admin/gallery", label: "Gallery", icon: Images },
      { href: "/admin/posts", label: "Posts", icon: Newspaper },
      { href: "/admin/show", label: "DataBrew", icon: Clapperboard },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
      { href: "/admin/learn", label: "Pathways", icon: Route },
    ],
  },
  {
    label: "People",
    links: [
      { href: "/admin/team", label: "Team", icon: Users, adminOnly: true },
      { href: "/admin/alumni", label: "Alumni", icon: GraduationCap, adminOnly: true },
      { href: "/admin/users", label: "Users & roles", icon: UserCog, adminOnly: true },
    ],
  },
  {
    label: "Admin only",
    links: [
      { href: "/admin/drives", label: "Drives", icon: Briefcase, adminOnly: true },
      { href: "/admin/sponsors", label: "Sponsors", icon: Handshake, adminOnly: true },
      { href: "/admin/resources", label: "Resources", icon: FolderOpen, adminOnly: true },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  email: string;
  role: Role;
  isAdmin: boolean;
};

export function AdminNav({ email, role, isAdmin }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => isAdmin || !link.adminOnly),
    }))
    .filter((group) => group.links.length > 0);

  const identity = (
    <div className="border-b border-line px-4 py-4">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-mute">
        Content desk
      </p>
      <p className="mt-2 break-all text-sm font-medium text-ink">{email}</p>
      <p className="mt-2 inline-flex rounded-sm border border-line px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-mute">
        {role}
        {!isAdmin ? " · drafts only" : " · can publish"}
      </p>
    </div>
  );

  const accountBlock = (
    <div className="shrink-0 space-y-1 border-b border-line bg-paper-elevated px-3 py-3">
      <Link
        href="/account"
        onClick={() => setOpen(false)}
        className="flex items-center gap-2.5 rounded-sm bg-ember/10 px-2.5 py-2.5 text-sm font-medium text-ember hover:bg-ember/15"
      >
        <UserRound size={16} aria-hidden />
        Account
      </Link>
      <Link
        href="/"
        onClick={() => setOpen(false)}
        className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-mute hover:bg-paper hover:text-ink"
      >
        <ExternalLink size={16} aria-hidden />
        View site
      </Link>
    </div>
  );

  const sectionNav = (
    <nav
      aria-label="Desk sections"
      className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4"
    >
      {visibleGroups.map((group) => (
        <div key={group.label}>
          <p className="px-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-mute">
            {group.label}
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {group.links.map((link) => {
              const active = isActive(pathname, link.href, link.exact);
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={
                      active
                        ? "flex items-center gap-2.5 rounded-sm bg-ember/10 px-2.5 py-2 text-sm font-medium text-ink"
                        : "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-mute transition-colors hover:bg-paper hover:text-ink"
                    }
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon
                      size={16}
                      aria-hidden
                      className={active ? "text-ember" : "text-mute"}
                    />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar — Account always visible */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-paper-elevated px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-mute">
            Desk
          </p>
          <p className="truncate text-sm font-medium capitalize text-ink">
            {role}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/account"
            className="inline-flex h-10 items-center gap-1.5 border border-ember/30 bg-ember/10 px-3 text-sm font-medium text-ember"
          >
            <UserRound size={16} aria-hidden />
            Account
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center border border-line text-ink"
            aria-expanded={open}
            aria-controls="admin-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="admin-mobile-nav"
          className="fixed inset-0 z-40 flex flex-col bg-paper-elevated lg:hidden"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-medium text-ink">Navigate</p>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center border border-line"
              onClick={() => setOpen(false)}
            >
              <X size={18} aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            {identity}
            {accountBlock}
            {sectionNav}
          </div>
        </div>
      ) : null}

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-paper-elevated lg:flex">
        {identity}
        {accountBlock}
        {sectionNav}
      </aside>
    </>
  );
}
