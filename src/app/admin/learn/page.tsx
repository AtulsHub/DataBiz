import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { isPathwaysDbReady, listAdminPathways } from "@/lib/pathways";
import { SeedPathwaysButton } from "@/components/admin/SeedPathwaysButton";

export const metadata: Metadata = { title: "Admin · Pathways" };

const disciplineLabel = {
  data: "Data",
  ml: "ML",
  ai: "AI",
  other: "Other",
} as const;

export default async function AdminLearnPage() {
  const dbReady = isPathwaysDbReady();
  const pathways = dbReady ? await listAdminPathways() : [];

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Pathways
          </h1>
          <p className="mt-2 max-w-xl text-mute">
            Publish learning pathways on `/learn`. Modules are external links
            only.
          </p>
        </div>
        {dbReady ? (
          <div className="flex flex-wrap gap-3">
            <SeedPathwaysButton />
            <Button href="/admin/learn/new" variant="ember">
              New pathway
            </Button>
          </div>
        ) : null}
      </div>

      {!dbReady ? (
        <p className="mt-8 border border-line bg-paper-elevated px-4 py-3 text-sm text-mute">
          Connect Neon to manage pathways. Public `/learn` still serves seed
          copy until then.
        </p>
      ) : pathways.length === 0 ? (
        <p className="mt-8 text-sm text-mute">
          No pathways yet. Seed the three starter pathways or create one.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {pathways.map((pathway) => (
            <li key={pathway.id}>
              <Link
                href={`/admin/learn/${pathway.id}`}
                className="grid gap-1 py-5 transition-colors hover:bg-paper-elevated sm:grid-cols-[1fr_6rem_8rem_6rem] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="font-medium text-ink">{pathway.title}</p>
                  <p className="mt-1 font-mono text-xs text-mute">
                    /learn/{pathway.slug}
                  </p>
                </div>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel">
                  {disciplineLabel[pathway.discipline]}
                </p>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-steel">
                  {pathway.status}
                </p>
                <p className="text-sm text-mute">
                  {pathway.modules.length} modules
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
