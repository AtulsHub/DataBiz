import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SponsorEditorForm } from "@/components/admin/SponsorEditorForm";
import { isSponsorsDbReady } from "@/lib/sponsors";

export const metadata: Metadata = { title: "Admin · New sponsor" };

export default function AdminNewSponsorPage() {
  if (!isSponsorsDbReady()) redirect("/admin/sponsors");
  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        New sponsor
      </h1>
      <div className="mt-10 max-w-xl">
        <SponsorEditorForm />
      </div>
    </Container>
  );
}
