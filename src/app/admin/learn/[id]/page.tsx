import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PathwayEditorForm } from "@/components/admin/PathwayEditorForm";
import { getAdminPathway, isPathwaysDbReady } from "@/lib/pathways";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pathway = await getAdminPathway(id);
  return { title: pathway ? `Admin · ${pathway.title}` : "Admin · Pathway" };
}

export default async function AdminPathwayDetailPage({ params }: Props) {
  if (!isPathwaysDbReady()) redirect("/admin/learn");
  const { id } = await params;
  const pathway = await getAdminPathway(id);
  if (!pathway?.id) notFound();

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {pathway.title}
      </h1>
      <p className="mt-2 font-mono text-xs text-mute">
        /learn/{pathway.slug} · {pathway.status}
      </p>
      <div className="mt-10 max-w-3xl">
        <PathwayEditorForm pathway={pathway} />
      </div>
    </Container>
  );
}
