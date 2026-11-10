import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin-guard";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { isResourcesDbReady, listResources } from "@/lib/resources";

export const metadata: Metadata = { title: "Admin · Resources" };

export default async function AdminResourcesPage() {
  await requireAdminPage();
  const dbReady = isResourcesDbReady();
  const items = dbReady ? await listResources() : [];

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Member resources
          </h1>
          <p className="mt-2 max-w-xl text-mute">
            Visible on `/account` for member and above.
          </p>
        </div>
        {dbReady ? (
          <Button href="/admin/resources/new" variant="ember">
            New resource
          </Button>
        ) : null}
      </div>
      {!dbReady ? (
        <p className="mt-8 text-sm text-mute">Connect Neon to manage resources.</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-sm text-mute">No resources yet.</p>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/admin/resources/${item.id}`}
                className="block py-4 font-medium hover:bg-paper-elevated"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
