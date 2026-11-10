import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin-guard";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ResourceEditorForm } from "@/components/admin/ResourceEditorForm";
import { getAdminResource, isResourcesDbReady } from "@/lib/resources";

export const instant = false;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const resource = await getAdminResource(id);
  return { title: resource ? `Admin · ${resource.title}` : "Admin · Resource" };
}

export default async function AdminResourceDetailPage({ params }: Props) {
  await requireAdminPage();
  if (!isResourcesDbReady()) redirect("/admin/resources");
  const { id } = await params;
  const resource = await getAdminResource(id);
  if (!resource) notFound();

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {resource.title}
      </h1>
      <div className="mt-10 max-w-xl">
        <ResourceEditorForm resource={resource} />
      </div>
    </Container>
  );
}
