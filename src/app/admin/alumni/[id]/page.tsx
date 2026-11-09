import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { AlumniEditorForm } from "@/components/admin/AlumniEditorForm";
import { getAdminAlumni, isAlumniDbReady } from "@/lib/alumni";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const alumni = await getAdminAlumni(id);
  return { title: alumni ? `Admin · ${alumni.name}` : "Admin · Alumni" };
}

export default async function AdminAlumniDetailPage({ params }: Props) {
  if (!isAlumniDbReady()) redirect("/admin/alumni");
  const { id } = await params;
  const alumni = await getAdminAlumni(id);
  if (!alumni?.id) notFound();

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {alumni.name}
      </h1>
      <p className="mt-2 font-mono text-xs text-mute">
        {alumni.slug} · {alumni.status}
      </p>
      <div className="mt-10 max-w-3xl">
        <AlumniEditorForm alumni={alumni} />
      </div>
    </Container>
  );
}
