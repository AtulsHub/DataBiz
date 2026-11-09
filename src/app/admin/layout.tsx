import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/session";
import { Container } from "@/components/ui/Container";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/learn", label: "Pathways" },
  { href: "/admin/drives", label: "Drives" },
  { href: "/admin/alumni", label: "Alumni" },
  { href: "/admin/users", label: "Users" },
] as const;

async function AdminShell({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await requireAdmin();

  return (
    <div className="min-h-full border-b border-line bg-paper">
      <div className="border-b border-line bg-paper-elevated">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="eyebrow">Admin</p>
            <p className="mt-1 text-sm text-mute">
              Signed in as {session.user.email}
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-mute transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/account" className="text-ember hover:underline">
              Account
            </Link>
          </nav>
        </Container>
      </div>
      {children}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-full border-b border-line bg-paper">
          <Container className="py-12 text-sm text-mute">
            Checking admin session…
          </Container>
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
