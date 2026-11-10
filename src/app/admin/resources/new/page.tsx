import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ResourceEditorForm } from "@/components/admin/ResourceEditorForm";
import { isResourcesDbReady } from "@/lib/resources";

export const metadata: Metadata = { title: "Admin · New resource" };

export default function AdminNewResourcePage() {
  if (!isResourcesDbReady()) redirect("/admin/resources");
  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        New resource
      </h1>
      <div className="mt-10 max-w-xl">
        <ResourceEditorForm />
      </div>
    </Container>
  );
}
