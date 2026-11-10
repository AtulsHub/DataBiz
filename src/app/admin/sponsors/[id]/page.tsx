import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SponsorEditorForm } from "@/components/admin/SponsorEditorForm";
import { getAdminSponsor, isSponsorsDbReady } from "@/lib/sponsors";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sponsor = await getAdminSponsor(id);
  return { title: sponsor ? `Admin · ${sponsor.name}` : "Admin · Sponsor" };
}

export default async function AdminSponsorDetailPage({ params }: Props) {
  if (!isSponsorsDbReady()) redirect("/admin/sponsors");
  const { id } = await params;
  const sponsor = await getAdminSponsor(id);
  if (!sponsor) notFound();

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {sponsor.name}
      </h1>
      <div className="mt-10 max-w-xl">
        <SponsorEditorForm sponsor={sponsor} />
      </div>
    </Container>
  );
}
