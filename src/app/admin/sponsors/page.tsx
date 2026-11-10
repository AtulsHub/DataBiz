import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin-guard";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BrochureSettingForm } from "@/components/admin/BrochureSettingForm";
import {
  getBrochurePublicId,
  isSponsorsDbReady,
  listSponsors,
} from "@/lib/sponsors";

export const metadata: Metadata = { title: "Admin · Sponsors" };

export default async function AdminSponsorsPage() {
  await requireAdminPage();
  const dbReady = isSponsorsDbReady();
  const sponsors = dbReady ? await listSponsors() : [];
  const brochureId = dbReady ? await getBrochurePublicId() : null;

  return (
    <Container className="space-y-14 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Sponsors
          </h1>
          <p className="mt-2 max-w-xl text-mute">
            Logos on `/sponsors`. Brochure page is `/brochure`; optional PDF override below.
          </p>
        </div>
        {dbReady ? (
          <Button href="/admin/sponsors/new" variant="ember">
            New sponsor
          </Button>
        ) : null}
      </div>

      {!dbReady ? (
        <p className="text-sm text-mute">Connect Neon to manage sponsors.</p>
      ) : (
        <>
          <section className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Brochure
            </h2>
            <p className="mt-2 text-sm text-mute">
              Paste a Cloudinary public id (raw PDF) or absolute URL. Empty
              hides the download button.
            </p>
            <div className="mt-4">
              <BrochureSettingForm defaultPublicId={brochureId ?? ""} />
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Logos
            </h2>
            {sponsors.length === 0 ? (
              <p className="mt-4 text-sm text-mute">No sponsors listed yet.</p>
            ) : (
              <ul className="mt-6 divide-y divide-line border-y border-line">
                {sponsors.map((sponsor) => (
                  <li key={sponsor.id}>
                    <Link
                      href={`/admin/sponsors/${sponsor.id}`}
                      className="block py-4 font-medium hover:bg-paper-elevated"
                    >
                      {sponsor.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </Container>
  );
}
